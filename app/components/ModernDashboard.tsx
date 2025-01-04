import React, { useEffect, useRef } from 'react';
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
import { TrendingUp, Users, MessageSquare, Activity, Bell, Search, Settings, User } from 'lucide-react';

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
const SentimentChart = () => {
    const chartRef = useRef(null);
  
    // Cleanup function to destroy chart instance
    useEffect(() => {
      return () => {
        if (chartRef.current) {
          chartRef.current.destroy();
        }
      };
    }, []);
  
    const data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Sentiment Score',
          data: [0.2, 0.5, 0.3, 0.8, 0.6, 0.9, 0.7],
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: 'white',
          pointBorderColor: 'rgb(147, 51, 234)',
          pointBorderWidth: 2,
        },
      ],
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
        <Line
          ref={chartRef}
          data={data}
          options={options}
        />
      </div>
    );
  };
  
  const ModernDashboard = () => {
    const username = "Avenster"; // Get this from your auth context/props
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
        {/* Navbar */}
        {/* <NavBar/> */}
        <div className="max-w-7xl mx-auto p-6 pt-20">
          {/* Welcome Message */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-800">
              Yo <span className="text-purple-600">{username}</span> 🌝
            </h1>
            <p className="text-gray-500 text-l mt-1">Here's what's popping rn</p>
          </div>
  
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard 
              title="Vibe check"
              value="+0.75"
              change="+12.5%"
              icon={<TrendingUp className="w-6 h-6 text-white-500" />}
              trend="positive"
              gradient="from-green-500 to-emerald-500"
            />
            <StatsCard 
              title="Total msgs"
              value="24.5K"
              change="+8.2%"
              icon={<MessageSquare className="w-6 h-6 text-white-500" />}
              trend="positive"
              gradient="from-purple-500 to-pink-500"
            />
            <StatsCard 
              title="Squad size"
              value="1,294"
              change="-3.1%"
              icon={<Users className="w-6 h-6 text-white-500" />}
              trend="negative"
              gradient="from-blue-500 to-cyan-500"
            />
            <StatsCard 
              title="Engagement"
              value="67.2%"
              change="+5.3%"
              icon={<Activity className="w-6 h-6 text-white-500" />}
              trend="positive"
              gradient="from-orange-500 to-yellow-500"
            />
          </div>
  
          {/* Main Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-purple-100/50 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                  Mood tracker <span className='text-white'> 📈</span>
                </h2>
                <p className="text-gray-500">Real-time vibes</p>
              </div>
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl">
                {['1H', '24H', '7D', '30D', 'ALL'].map((period) => (
                  <button
                    key={period}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${period === '24H' 
                        ? 'bg-white text-purple-600 shadow-sm' 
                        : 'text-gray-500 hover:text-purple-600'
                      }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <SentimentChart />
          </div>
  
          {/* Bottom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trending Topics */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-purple-100/50 p-6">
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text mb-4">
                Trending rn <span className='text-white'> ☠️ </span>
              </h3>
              <div className="space-y-4">
                {[
                  { term: '#ProductLaunch', score: 0.85, volume: '12.3K' },
                  { term: '#CustomerService', score: -0.32, volume: '8.7K' },
                  { term: '#UserExperience', score: 0.64, volume: '6.2K' },
                  { term: '#Innovation', score: 0.91, volume: '4.8K' },
                ].map((keyword) => (
                  <div key={keyword.term} 
                       className="flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-purple-50 hover:scale-102">
                    <div>
                      <div className="font-medium text-gray-800">{keyword.term}</div>
                      <div className="text-sm text-gray-500">{keyword.volume} mentions</div>
                    </div>
                    <div className={`font-semibold px-3 py-1 rounded-full ${
                      keyword.score >= 0 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {keyword.score.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-purple-100/50 p-6">
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text mb-4">
                Latest tea <span className='text-white'> ☕️</span>
              </h3>
              <div className="space-y-4">
                {[
                  { platform: 'Twitter', message: 'New trending topic detected', time: '2m ago', icon: '🐦' },
                  { platform: 'Reddit', message: 'Sentiment spike detected', time: '5m ago', icon: '🎯' },
                  { platform: 'YouTube', message: 'Comments analysis complete', time: '12m ago', icon: '📺' },
                  { platform: 'News', message: 'New articles processed', time: '15m ago', icon: '📰' },
                ].map((activity, index) => (
                  <div key={index} 
                       className="flex items-center space-x-4 p-4 rounded-2xl transition-all hover:bg-purple-50">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{activity.message}</div>
                      <div className="text-sm text-gray-500">{activity.platform} • {activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Enhanced Stats Card Component
  const StatsCard = ({ title, value, change, icon, trend, gradient }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-purple-100/50 p-6 hover:transform hover:scale-105 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient}`}>
          <div className="text-white">{icon}</div>
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