import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { complaintStorage, trainStorage } from '../utils/localStorage';
import { formatDate } from '../utils/helpers';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, resolved
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    trainNumber: '',
    description: '',
  });

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = () => {
    const allComplaints = complaintStorage.getAll();
    setComplaints(allComplaints.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.name || !formData.trainNumber || !formData.description) {
      alert('Please fill all fields');
      return;
    }

    const complaint = {
      id: Date.now().toString(),
      category: formData.category,
      name: formData.name,
      trainNumber: formData.trainNumber,
      description: formData.description,
      status: 'Pending',
      date: new Date().toISOString(),
    };

    complaintStorage.add(complaint);
    loadComplaints();
    resetForm();
  };

  const handleStatusChange = (id, newStatus) => {
    complaintStorage.update(id, { status: newStatus });
    loadComplaints();
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
    return complaint.status.toLowerCase() === filter.toLowerCase();
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Complaints Management</h1>
          <p className="text-gray-600">File and manage complaints</p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>{showForm ? 'Cancel' : 'File Complaint'}</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Complaints</p>
              <p className="text-3xl font-bold text-gray-800">{complaints.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-gray-600" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-green-600">{resolvedCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex space-x-2">
          {['all', 'pending', 'resolved'].map((filterOption) => (
            <motion.button
              key={filterOption}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === filterOption
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Complaint Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">File a Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Train Number</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe your complaint in detail..."
                />
              </div>
              <div className="flex space-x-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
                >
                  Submit Complaint
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
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
            className="bg-white rounded-xl shadow-md p-12 text-center"
          >
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No complaints found</p>
          </motion.div>
        ) : (
          filteredComplaints.map((complaint, index) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      complaint.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {complaint.status}
                    </span>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                      {complaint.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(complaint.date)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Complaint by {complaint.name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Train:</span> #{complaint.trainNumber}
                  </p>
                  <p className="text-gray-700">{complaint.description}</p>
                </div>
                <div className="flex space-x-2">
                  {complaint.status === 'Pending' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusChange(complaint.id, 'Resolved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Mark Resolved</span>
                    </motion.button>
                  )}
                  {complaint.status === 'Resolved' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusChange(complaint.id, 'Pending')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 flex items-center space-x-2"
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
  );
};

export default Complaints;

