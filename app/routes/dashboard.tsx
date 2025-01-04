import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, TrendingUp, Users, Activity } from 'lucide-react';
import NavBar from '~/components/Navbar';
import ModernDashboard from '~/components/ModernDashboard';
const SentimentDashboard = () => {
    return(
    <div>
        <NavBar/>
        <ModernDashboard/>

    </div>
  );
};

export default SentimentDashboard;
