import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { complaintAPI, userAPI } from '../utils/api';
import { formatDate } from '../utils/helpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, resolved
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState({ byCategory: {}, byStatus: { Pending: 0, Resolved: 0 } });
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    trainNumber: '',
    description: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userAPI.getMe();
        setUser(userData);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadComplaints();
    }
  }, [user]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      let allComplaints;
      if (user && user.role === 'admin') {
        allComplaints = await complaintAPI.getAll();
      } else {
        allComplaints = await complaintAPI.getMy();
      }
      setComplaints(allComplaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

      // Calculate chart data
      const byCategory = {};
      let pendingCount = 0;
      let resolvedCount = 0;

      allComplaints.forEach(complaint => {
        byCategory[complaint.category] = (byCategory[complaint.category] || 0) + 1;
        if (complaint.status === 'Pending') {
          pendingCount++;
        } else if (complaint.status === 'Resolved') {
          resolvedCount++;
        }
      });

      setChartData({
        byCategory,
        byStatus: { Pending: pendingCount, Resolved: resolvedCount },
      });
    } catch (error) {
      console.error('Error loading complaints:', error);
      setError('Failed to load complaints. Please check if the server is running.');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.name || !formData.trainNumber || !formData.description) {
      alert('Please fill all fields');
      return;
    }

    try {
      await complaintAPI.create(formData);
      await loadComplaints();
      resetForm();
    } catch (error) {
      console.error('Error creating complaint:', error);
      alert('Error creating complaint: ' + (error.message || 'Unknown error'));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await complaintAPI.update(id, { status: newStatus });
      await loadComplaints();
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert('Error updating complaint: ' + (error.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      name: '',
      trainNumber: '',
      description: '',
    });
    setShowForm(false);
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'all') return true;
    if (filter === 'pending') return complaint.status === 'Pending';
    if (filter === 'resolved') return complaint.status === 'Resolved';
    return false;
  });

  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  const categories = [
    'Service Quality',
    'Cleanliness',
    'Food & Beverage',
    'Staff Behavior',
    'Delay Issues',
    'Seat Problems',
    'Other',
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Complaints Management</h1>
            <p className="text-gray-600 text-sm sm:text-base">File and manage complaints</p>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="w-full md:w-auto px-4 py-3 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm sm:text-base">{showForm ? 'Cancel' : 'File Complaint'}</span>
          </motion.button>
        </div>

        {/* Stats - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-5 sm:p-7 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Complaints</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{complaints.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-5 sm:p-7 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-600" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-5 sm:p-7 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Resolved</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{resolvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
            </div>
          </motion.div>
        </div>

        {/* Filter - Mobile Responsive */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 border border-gray-200">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'resolved'].map((filterOption) => (
              <motion.button
                key={filterOption}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(filterOption)}
                className={`flex-1 min-w-max px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  filter === filterOption
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Charts - Statistics Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.keys(chartData.byCategory).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-5 sm:p-7 border border-gray-200"
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Complaints by Category</h3>
              <div className="h-80 w-full flex items-center justify-center">
                <Pie
                  data={{
                    labels: Object.keys(chartData.byCategory),
                    datasets: [
                      {
                        label: 'Count',
                        data: Object.values(chartData.byCategory),
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
                          color: '#d1d5db',
                          font: { size: 11 },
                          padding: 12,
                        },
                      },
                    },
                  }}
                />
              </div>
            </motion.div>
          )}

          {Object.keys(chartData.byStatus).some(key => chartData.byStatus[key] > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-5 sm:p-7 border border-gray-200"
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Complaints by Status</h3>
              <div className="h-80 w-full flex items-center justify-center">
                <Bar
                  data={{
                    labels: ['Pending', 'Resolved'],
                    datasets: [
                      {
                        label: 'Count',
                        data: [chartData.byStatus.Pending, chartData.byStatus.Resolved],
                        backgroundColor: ['rgba(251, 191, 36, 0.7)', 'rgba(34, 197, 94, 0.7)'],
                        borderColor: ['rgba(251, 191, 36, 1)', 'rgba(34, 197, 94, 1)'],
                        borderWidth: 2,
                        borderRadius: 8,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        ticks: { color: '#d1d5db' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                      },
                      y: {
                        ticks: { color: '#d1d5db' },
                      },
                    },
                  }}
                />
              </div>
            </motion.div>
          )}
      {/* Complaint Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 border border-gray-200"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">File a Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base bg-white text-gray-900"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Train Number</label>
                  <input
                    type="text"
                    value={formData.trainNumber}
                    onChange={(e) => setFormData({ ...formData, trainNumber: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter train number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Describe your complaint in detail..."
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-sm sm:text-base"
                >
                  Submit Complaint
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 sm:px-6 sm:py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 text-sm sm:text-base"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-gray-200 text-center"
          >
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-base sm:text-lg">No complaints found</p>
          </motion.div>
        ) : (
          filteredComplaints.map((complaint, index) => (
            <motion.div
              key={complaint._id || complaint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-xl p-5 sm:p-7 border border-gray-200 hover:shadow-2xl hover:scale-[1.02] transition-all"
            >
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 gap-y-2 mb-3">
                    <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold ${
                      complaint.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {complaint.status}
                    </span>
                    <span className="px-2 py-1 sm:px-3 sm:py-1 bg-blue-900 text-blue-200 rounded-full text-xs sm:text-sm font-semibold">
                      {complaint.category}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {formatDate(complaint.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                    Complaint by {complaint.name}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300 mb-2">
                    <span className="font-semibold">Train:</span> #{complaint.trainNumber}
                  </p>
                  <p className="text-sm sm:text-base text-gray-400">{complaint.description}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-300">
                  {filter === 'pending' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusChange(complaint._id || complaint.id, 'Resolved')}
                      className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Mark Resolved</span>
                    </motion.button>
                  )}
                  {filter === 'resolved' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusChange(complaint._id || complaint.id, 'Pending')}
                      className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Mark Pending</span>
                    </motion.button>
                  )}
                  {filter === 'all' && complaint.status === 'Pending' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusChange(complaint._id || complaint.id, 'Resolved')}
                      className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Mark Resolved</span>
                    </motion.button>
                  )}
                  {filter === 'all' && complaint.status === 'Resolved' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusChange(complaint._id || complaint.id, 'Pending')}
                      className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Mark Pending</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;

