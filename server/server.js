const express = require('express');
const WebSocket = require('ws');
const axios = require('axios');
const { MongoClient } = require('mongodb');
const Sentiment = require('sentiment');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const wss = new WebSocket.Server({ noServer: true });

// Configuration
const PORT = process.env.PORT || 5000;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const MONGO_URI = process.env.MONGO_URL;

// MongoDB Client
const client = new MongoClient(MONGO_URI);

// Sentiment Analysis Client
const sentiment = new Sentiment();

// Channel Cache
const channelCache = new Map();

// Helper: Get Channel ID from handle or ID
async function getChannelId(channelIdentifier) {
    try {
        // If it's already a channel ID (starts with UC), return it
        if (channelIdentifier.startsWith('UC')) {
            return channelIdentifier;
        }

        // Remove @ if present
        const handle = channelIdentifier.replace('@', '');
        
        // Use search endpoint to get channel ID
        const searchUrl = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${handle}&type=channel&key=${YOUTUBE_API_KEY}`;
        const searchResponse = await axios.get(searchUrl);
        
        if (!searchResponse.data.items?.length) {
            throw new Error('Channel not found');
        }

        return searchResponse.data.items[0].id.channelId;
    } catch (error) {
        console.error('Error getting channel ID:', error);
        throw error;
    }
}

// Helper: Fetch Channel Info
async function fetchChannelInfo(channelId) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
        const response = await axios.get(url);
        
        if (response.data.items && response.data.items.length > 0) {
            const channel = response.data.items[0];
            return {
                id: channel.id,
                title: channel.snippet.title,
                description: channel.snippet.description,
                thumbnailUrl: channel.snippet.thumbnails.default.url,
                subscriberCount: channel.statistics.subscriberCount,
                videoCount: channel.statistics.videoCount
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching channel info:', error);
        throw error;
    }
}

// Helper: Fetch YouTube Comments
async function fetchYouTubeComments(videoId) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${YOUTUBE_API_KEY}&maxResults=100`;
        const response = await axios.get(url);
        return response.data.items.map((item) => ({
            text: item.snippet.topLevelComment.snippet.textDisplay,
            author: item.snippet.topLevelComment.snippet.authorDisplayName,
            publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
            likeCount: item.snippet.topLevelComment.snippet.likeCount
        }));
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
}

// Helper: Perform Sentiment Analysis
function analyzeSentiment(text) {
    const result = sentiment.analyze(text);
    return {
        score: result.score,
        comparative: result.comparative
    };
}

// WebSocket Connection Handler
wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('message', async (message) => {
        try {
            const { channelId: channelIdentifier } = JSON.parse(message);
            console.log('Received channel identifier:', channelIdentifier);
            
            try {
                const actualChannelId = await getChannelId(channelIdentifier);
                await streamSentiments(ws, actualChannelId);
            } catch (error) {
                console.error('Error processing channel:', error);
                ws.send(JSON.stringify({ 
                    type: 'error', 
                    message: 'Could not find channel or process request' 
                }));
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Invalid message format' 
            }));
        }
    });
    
    ws.on('close', () => console.log('Client disconnected'));
});

// Fetch and Stream Data
async function streamSentiments(ws, channelId) {
    try {
        // Get channel info
        let channelInfo = channelCache.get(channelId);
        if (!channelInfo) {
            channelInfo = await fetchChannelInfo(channelId);
            if (channelInfo) {
                channelCache.set(channelId, channelInfo);
            }
        }

        // Send channel info
        ws.send(JSON.stringify({ type: 'channel_info', data: channelInfo }));

        // Fetch recent videos
        const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&key=${YOUTUBE_API_KEY}&maxResults=5&order=date&type=video`;
        const response = await axios.get(videosUrl);
        
        if (!response.data.items) {
            throw new Error('No videos found');
        }

        for (const video of response.data.items) {
            try {
                const comments = await fetchYouTubeComments(video.id.videoId);
                
                for (const comment of comments) {
                    const sentimentData = analyzeSentiment(comment.text);
                    const data = {
                        type: 'sentiment_data',
                        data: {
                            videoId: video.id.videoId,
                            videoTitle: video.snippet.title,
                            comment: comment.text,
                            author: comment.author,
                            publishedAt: comment.publishedAt,
                            likeCount: comment.likeCount,
                            sentiment: sentimentData,
                            timestamp: new Date().toISOString()
                        }
                    };

                    // Store in MongoDB
                    const db = client.db('sentimentDashboard');
                    const collection = db.collection('sentiments');
                    await collection.insertOne(data.data);

                    // Send to client
                    ws.send(JSON.stringify(data));
                }
            } catch (error) {
                console.error('Error processing video:', error);
                continue; // Skip to next video if there's an error
            }
        }
    } catch (error) {
        console.error('Error in streamSentiments:', error);
        ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Error processing channel data' 
        }));
    }
}

// REST API endpoints
app.get('/api/channel/:channelId', async (req, res) => {
    try {
        const actualChannelId = await getChannelId(req.params.channelId);
        const channelInfo = await fetchChannelInfo(actualChannelId);
        if (channelInfo) {
            res.json(channelInfo);
        } else {
            res.status(404).json({ error: 'Channel not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
const server = app.listen(PORT, async () => {
    await client.connect();
    console.log(`Server running on port ${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});