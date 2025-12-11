import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Train, Ticket, MapPin, AlertCircle, TrendingUp } from 'lucide-react';
import { trainStorage, bookingStorage, complaintStorage } from '../utils/localStorage';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTrains: 0,
    totalBookings: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
  });

  useEffect(() => {
    const trains = trainStorage.getAll();
    const bookings = bookingStorage.getAll();
    const complaints = complaintStorage.getAll();
    
    setStats({
      totalTrains: trains.length,
      totalBookings: bookings.length,
      pendingComplaints: complaints.filter(c => c.status === 'Pending').length,
      resolvedComplaints: complaints.filter(c => c.status === 'Resolved').length,
    });
  }, []);

  const statCards = [
    {
      title: 'Total Trains',
      value: stats.totalTrains,
      icon: Train,
      color: 'bg-blue-500',
      link: '/schedule',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Ticket,
      color: 'bg-green-500',
      link: '/book-ticket',
    },
    {
      title: 'Pending Complaints',
      value: stats.pendingComplaints,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      link: '/complaints',
    },
    {
      title: 'Resolved Complaints',
      value: stats.resolvedComplaints,
      icon: TrendingUp,
      color: 'bg-purple-500',
      link: '/complaints',
    },
  ];

  const quickActions = [
    { path: '/book-ticket', label: 'Book Ticket', icon: '🎫', color: 'from-blue-500 to-blue-600' },
    { path: '/schedule', label: 'View Schedule', icon: '🚆', color: 'from-green-500 to-green-600' },
    { path: '/track-train', label: 'Track Train', icon: '📍', color: 'from-purple-500 to-purple-600' },
    { path: '/seat-availability', label: 'Check Seats', icon: '🪑', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to Railway Management System</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.link}>
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-4 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div className={`bg-gradient-to-r ${action.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer`}>
                  <div className="text-4xl mb-2">{action.icon}</div>
                  <div className="font-semibold text-lg">{action.label}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">System Overview</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Train className="h-5 w-5 text-primary-600" />
              <span className="font-medium">Active Trains</span>
            </div>
            <span className="text-primary-600 font-bold">{stats.totalTrains}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Ticket className="h-5 w-5 text-green-600" />
              <span className="font-medium">Total Bookings</span>
            </div>
            <span className="text-green-600 font-bold">{stats.totalBookings}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium">Complaints Status</span>
            </div>
            <span className="text-yellow-600 font-bold">
              {stats.pendingComplaints} Pending / {stats.resolvedComplaints} Resolved
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

