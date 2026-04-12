import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Ticket, TrendingUp } from 'lucide-react';
import { bookingAPI, complaintAPI } from '../utils/api';
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
  const [complaintChartData, setComplaintChartData] = useState({
    categories: {},
    statuses: { Pending: 0, Resolved: 0 },
  });

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

        // Calculate complaints by category and status
        const complaintsByCategory = {};
        let pendingCount = 0;
        let resolvedCount = 0;

        complaints.forEach(complaint => {
          // Count by category
          complaintsByCategory[complaint.category] = (complaintsByCategory[complaint.category] || 0) + 1;
          // Count by status
          if (complaint.status === 'Pending') {
            pendingCount++;
          } else if (complaint.status === 'Resolved') {
            resolvedCount++;
          }
        });

        setComplaintChartData({
          categories: complaintsByCategory,
          statuses: { Pending: pendingCount, Resolved: resolvedCount },
        });
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
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100 mt-6"
        >
          <h2 className="text-xl font-bold text-blue-900 mb-4">Bookings by Train</h2>
          <div className="h-80 w-full">
            <Bar
              data={{
                labels: chartData.map(item => item.train),
                datasets: [
                  {
                    label: 'Number of Bookings',
                    data: chartData.map(item => item.count),
                    backgroundColor: 'rgba(37, 99, 235, 0.7)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                    tension: 0.1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    labels: {
                      color: '#1e3a8a',
                      font: { size: 12 },
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    cornerRadius: 8,
                    padding: 12,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { color: '#1e3a8a' },
                    grid: { color: 'rgba(37, 99, 235, 0.1)' },
                  },
                  x: {
                    ticks: { color: '#1e3a8a' },
                    grid: { color: 'rgba(37, 99, 235, 0.1)' },
                  },
                },
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Charts Grid - Complaints Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints by Category */}
        {Object.keys(complaintChartData.categories).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100"
          >
            <h2 className="text-xl font-bold text-blue-900 mb-4">Complaints by Category</h2>
            <div className="h-80 w-full flex items-center justify-center">
              <Pie
                data={{
                  labels: Object.keys(complaintChartData.categories),
                  datasets: [
                    {
                      label: 'Number of Complaints',
                      data: Object.values(complaintChartData.categories),
                      backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(199, 199, 199, 0.7)',
                      ],
                      borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(199, 199, 199, 1)',
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#1e3a8a',
                        font: { size: 12 },
                        padding: 15,
                      },
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      cornerRadius: 8,
                      padding: 12,
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Complaint Status Distribution */}
        {(complaintChartData.statuses.Pending > 0 || complaintChartData.statuses.Resolved > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100"
          >
            <h2 className="text-xl font-bold text-blue-900 mb-4">Complaint Status</h2>
            <div className="h-80 w-full flex items-center justify-center">
              <Doughnut
                data={{
                  labels: ['Pending', 'Resolved'],
                  datasets: [
                    {
                      label: 'Complaints',
                      data: [complaintChartData.statuses.Pending, complaintChartData.statuses.Resolved],
                      backgroundColor: [
                        'rgba(251, 191, 36, 0.7)',
                        'rgba(34, 197, 94, 0.7)',
                      ],
                      borderColor: [
                        'rgba(251, 191, 36, 1)',
                        'rgba(34, 197, 94, 1)',
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#1e3a8a',
                        font: { size: 12 },
                        padding: 15,
                      },
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      cornerRadius: 8,
                      padding: 12,
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        )}
      </div>

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

