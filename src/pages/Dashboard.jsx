import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Ticket, TrendingUp } from 'lucide-react';
import { bookingAPI, complaintAPI } from '../utils/api';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    resolvedComplaints: 0,
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        let bookings, complaints;
        if (user.role === 'admin') {
          [bookings, complaints] = await Promise.all([
            bookingAPI.getAll(),
            complaintAPI.getAll(),
          ]);
        } else {
          [bookings, complaints] = await Promise.all([
            bookingAPI.getMy(),
            complaintAPI.getMy(),
          ]);
        }
        
        setStats({
          totalBookings: bookings.length,
          resolvedComplaints: complaints.filter(c => c.status === 'Resolved').length,
        });

        // Calculate bookings by train
        const bookingsByTrain = {};
        bookings.forEach(booking => {
          const trainName = booking.trainName;
          bookingsByTrain[trainName] = (bookingsByTrain[trainName] || 0) + 1;
        });
        const chart = Object.entries(bookingsByTrain).map(([train, count]) => ({
          train,
          count,
        }));
        setChartData(chart);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    
    loadStats();
  }, [user]);

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Ticket,
      color: 'bg-green-500',
      link: '/book-ticket',
    },
    {
      title: 'Resolved Complaints',
      value: stats.resolvedComplaints,
      icon: TrendingUp,
      color: 'bg-purple-500',
      link: '/complaints',
    },
  ];

  let quickActions = [
    { path: '/seat-availability', label: 'Check Seats', icon: '🪑', color: 'from-orange-500 to-orange-600' },
    { path: '/complaints', label: 'Manage Complaints', icon: '⚠️', color: 'from-red-500 to-red-600' },
  ];
  if (user && user.role !== 'admin') {
    quickActions = [
      { path: '/book-ticket', label: 'Book Ticket', icon: '🎫', color: 'from-blue-500 to-blue-600' },
      { path: '/my-tickets', label: 'My Tickets', icon: '📋', color: 'from-green-500 to-green-600' },
      { path: '/track-train', label: 'Track Train', icon: '📍', color: 'from-purple-500 to-purple-600' },
      ...quickActions
    ];
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-2 md:px-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-1 tracking-tight">Dashboard</h1>
          <p className="text-blue-700 font-medium">Welcome to Railway Management System</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.link}>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-2xl transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-500 text-xs font-semibold uppercase tracking-wide">{stat.title}</p>
                    <p className="text-3xl font-extrabold text-blue-900 mt-2 group-hover:text-blue-700 transition-colors">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl shadow-md bg-opacity-90`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-bold text-blue-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={action.path}>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-900 shadow hover:shadow-xl transition-all cursor-pointer flex flex-col items-center gap-2">
                  <div className="text-4xl mb-1">{action.icon}</div>
                  <div className="font-semibold text-base">{action.label}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bookings Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 mt-6"
        >
          <h2 className="text-xl font-bold text-blue-900 mb-4">Bookings by Train</h2>
          <div className="h-64">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              {chartData.map((item, index) => {
                const barWidth = 40;
                const barSpacing = 60;
                const maxCount = Math.max(...chartData.map(d => d.count));
                const barHeight = (item.count / maxCount) * 150;
                const x = index * barSpacing + 50;
                const y = 180 - barHeight;
                return (
                  <g key={item.train}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill="#2563eb"
                      className="hover:fill-blue-400 transition-colors"
                      rx="8"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 5}
                      textAnchor="middle"
                      className="text-sm font-bold fill-blue-900"
                    >
                      {item.count}
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y={195}
                      textAnchor="middle"
                      className="text-xs fill-blue-500"
                      transform={`rotate(-45, ${x + barWidth / 2}, 195)`}
                    >
                      {item.train.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </motion.div>
      )}

      {/* Recent Activity / System Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 mt-6"
      >
        <h2 className="text-xl font-bold text-blue-900 mb-4">System Overview</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-3">
              <Ticket className="h-5 w-5 text-green-600" />
              <span className="font-medium text-blue-900">Total Bookings</span>
            </div>
            <span className="text-green-600 font-bold">{stats.totalBookings}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-blue-900">Resolved Complaints</span>
            </div>
            <span className="text-purple-600 font-bold">{stats.resolvedComplaints}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

