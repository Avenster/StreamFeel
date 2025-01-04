import React, { useEffect, useRef, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Users, MessageSquare, Activity, Search } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const ChannelSearch = ({ onChannelSelect }) => {
    const [channelUrl, setChannelUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Extract channel identifier (ID or handle) from URL
        let channelId = channelUrl;
        if (channelUrl.includes('youtube.com/')) {
            // Handle different URL formats
            if (channelUrl.includes('/channel/')) {
                const matches = channelUrl.match(/channel\/([^\/\?]+)/);
                if (matches) channelId = matches[1];
            } else if (channelUrl.includes('/@')) {
                const matches = channelUrl.match(/@([^\/\?]+)/);
                if (matches) channelId = '@' + matches[1];
            }
        } else if (channelUrl.startsWith('@')) {
            channelId = channelUrl;
        }

        onChannelSelect(channelId);
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex gap-4">
                <input
                    type="text"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    placeholder="Enter YouTube channel ID or URL"
                    className="flex-1 px-4 py-2 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-500"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                    <Search className="w-4 h-4" />
                    {isLoading ? 'Loading...' : 'Analyze'}
                </button>
            </div>
        </form>
    );
};
const ChannelInfo = ({ channelInfo }) => {
    if (!channelInfo) return null;

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-purple-100/50 p-6 mb-8">
            <div className="flex items-center gap-6">
                <img
                    src={channelInfo.thumbnailUrl}
                    alt={channelInfo.title}
                    className="w-24 h-24 rounded-full"
                />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{channelInfo.title}</h2>
                    <p className="text-gray-500 mt-1">{channelInfo.description}</p>
                    <div className="flex gap-4 mt-2">
                        <span className="text-sm text-gray-600">
                            {parseInt(channelInfo.subscriberCount).toLocaleString()} subscribers
                        </span>
                        <span className="text-sm text-gray-600">
                            {parseInt(channelInfo.videoCount).toLocaleString()} videos
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
const SentimentChart = ({ sentimentData }) => {
    const chartRef = useRef(null);

    const data = {
        labels: sentimentData.map(d => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [{
            label: 'Sentiment Score',
            data: sentimentData.map(d => d.sentiment.comparative),
            borderColor: 'rgb(147, 51, 234)',
            backgroundColor: 'rgba(147, 51, 234, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: 'white',
            pointBorderColor: 'rgb(147, 51, 234)',
            pointBorderWidth: 2,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                    family: 'Inter',
                },
                bodyFont: {
                    size: 12,
                    family: 'Inter',
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div className="w-full h-96">
            <Line ref={chartRef} data={data} options={options} />
        </div>
    );
};

const ModernDashboard = () => {
    const [channelInfo, setChannelInfo] = useState(null);
    const [sentimentData, setSentimentData] = useState([]);
    const [stats, setStats] = useState({
        averageSentiment: 0,
        totalMessages: 0,
        uniqueUsers: 0,
        engagementRate: 0
    });
    const [wsConnected, setWsConnected] = useState(false);
    const ws = useRef(null);

    const connectToChannel = (channelId) => {
        // Close existing connection if any
        if (ws.current) {
            ws.current.close();
        }

        // Clear existing data
        setSentimentData([]);
        setStats({
            averageSentiment: 0,
            totalMessages: 0,
            uniqueUsers: 0,
            engagementRate: 0
        });

        // Initialize new WebSocket connection
        ws.current = new WebSocket('ws://localhost:5000');

        ws.current.onopen = () => {
            setWsConnected(true);
            // Send channel ID to server
            ws.current.send(JSON.stringify({ channelId }));
        };

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'channel_info') {
                setChannelInfo(message.data);
            } else if (message.type === 'sentiment_data') {
                const newData = message.data;
                setSentimentData(prev => {
                    const updated = [...prev, newData].slice(-50);

                    // Update stats
                    const avgSentiment = updated.reduce((acc, curr) => acc + curr.sentiment.comparative, 0) / updated.length;
                    setStats(prevStats => ({
                        averageSentiment: avgSentiment.toFixed(2),
                        totalMessages: prevStats.totalMessages + 1,
                        uniqueUsers: new Set(updated.map(d => d.author)).size,
                        engagementRate: ((updated.length / prevStats.totalMessages) * 100).toFixed(1)
                    }));

                    return updated;
                });
            }
        };

        ws.current.onclose = () => {
            setWsConnected(false);
        };
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
            <div className="max-w-7xl mx-auto p-6 pt-20">
                <div className="mb-8">
                <h1 className="text-xl font-bold text-gray-800">
                        YouTube Channel Sentiment Dashboard {wsConnected ? '🟢' : '🔴'}
                    </h1>
                    <p className="text-gray-500 text-l mt-1">Real-time sentiment analysis</p>
                </div>
                <ChannelSearch onChannelSelect={connectToChannel} />
                
                {channelInfo && <ChannelInfo channelInfo={channelInfo} />}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatsCard 
                        title="Average Sentiment"
                        value={stats.averageSentiment}
                        change="+12.5%"
                        icon={<TrendingUp className="w-6 h-6 text-white-500" />}
                        trend={stats.averageSentiment >= 0 ? 'positive' : 'negative'}
                        gradient="from-green-500 to-emerald-500"
                    />
                    <StatsCard 
                        title="Total Messages"
                        value={stats.totalMessages}
                        change="+8.2%"
                        icon={<MessageSquare className="w-6 h-6 text-white-500" />}
                        trend="positive"
                        gradient="from-purple-500 to-pink-500"
                    />
                    <StatsCard 
                        title="Unique Users"
                        value={stats.uniqueUsers}
                        change="-3.1%"
                        icon={<Users className="w-6 h-6 text-white-500" />}
                        trend="positive"
                        gradient="from-blue-500 to-cyan-500"
                    />
                    <StatsCard 
                        title="Engagement Rate"
                        value={`${stats.engagementRate}%`}
                        change="+5.3%"
                        icon={<Activity className="w-6 h-6 text-white-500" />}
                        trend="positive"
                        gradient="from-orange-500 to-yellow-500"
                    />
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-purple-100/50 p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                                Sentiment Trends
                            </h2>
                            <p className="text-gray-500">Real-time sentiment analysis</p>
                        </div>
                    </div>
                    <SentimentChart sentimentData={sentimentData} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-purple-100/50 p-6">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text mb-4">
                            Recent Comments
                        </h3>
                        <div className="space-y-4">
                            {sentimentData.slice(-4).reverse().map((data, index) => (
                                <div key={index} 
                                     className="flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-purple-50">
                                    <div>
                                        <div className="font-medium text-gray-800">{data.comment.slice(0, 50)}...</div>
                                        <div className="text-sm text-gray-500">{new Date(data.timestamp).toLocaleTimeString()}</div>
                                    </div>
                                    <div className={`font-semibold px-3 py-1 rounded-full ${
                                        data.sentiment.score >= 0 
                                            ? 'bg-green-100 text-green-600' 
                                            : 'bg-red-100 text-red-600'
                                    }`}>
                                        {data.sentiment.comparative.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-purple-100/50 p-6">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text mb-4">
                            Video Analysis
                        </h3>
                        <div className="space-y-4">
                            {Array.from(new Set(sentimentData.map(d => d.videoTitle))).slice(0, 4).map((title, index) => {
                                const videoComments = sentimentData.filter(d => d.videoTitle === title);
                                const avgSentiment = videoComments.reduce((acc, curr) => acc + curr.sentiment.comparative, 0) / videoComments.length;
                                
                                return (
                                    <div key={index} 
                                         className="flex items-center space-x-4 p-4 rounded-2xl transition-all hover:bg-purple-50">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl">
                                            📺
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800">{title}</div>
                                            <div className="text-sm text-gray-500">
                                                {videoComments.length} comments • Avg: {avgSentiment.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatsCard = ({ title, value, change, icon, trend, gradient }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-purple-100/50 p-6 hover:transform hover:scale-105 transition-all duration-300">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient}`}>
                {icon}
            </div>
        </div>
        <div className={`mt-2 text-sm font-medium ${
            trend === 'positive' ? 'text-green-500' : 'text-red-500'
        }`}>
            {trend === 'positive' ? '📈 ' : '📉 '}{change}
        </div>
    </div>
);

export default ModernDashboard;