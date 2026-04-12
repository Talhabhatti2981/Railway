import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { trainAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const AdminAddTrain = () => {
  const navigate = useNavigate();
  const [trains, setTrains] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    // Only admin can access this page
    if (userData && userData.role !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadTrains();
    }
  }, [user]);

  const [formData, setFormData] = useState({
    trainNumber: '',
    name: '',
    from: '',
    to: '',
    classes: [],
    seats: {},
    fare: {},
  });

  const trainClasses = [
    'AC First',
    'AC Second',
    'AC Third',
    'Sleeper',
    'AC Chair Car',
    'Executive',
  ];

  const loadTrains = async () => {
    try {
      setLoading(true);
      const data = await trainAPI.getAll();
      setTrains(data);
    } catch (err) {
      setError('Failed to load trains');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const selectedClasses = Array.from(e.target.selectedOptions, option => option.value);
    const newSeats = {};
    const newFare = {};
    selectedClasses.forEach(cls => {
      newSeats[cls] = formData.seats[cls] || 0;
      newFare[cls] = formData.fare[cls] || 0;
    });
    setFormData({
      ...formData,
      classes: selectedClasses,
      seats: newSeats,
      fare: newFare,
    });
  };

  const handleSeatChange = (cls, value) => {
    setFormData({
      ...formData,
      seats: { ...formData.seats, [cls]: parseInt(value) || 0 },
    });
  };

  const handleFareChange = (cls, value) => {
    setFormData({
      ...formData,
      fare: { ...formData.fare, [cls]: parseInt(value) || 0 },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.trainNumber || !formData.name || !formData.from || !formData.to || formData.classes.length === 0) {
      setError('Please fill all fields and select at least one class');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await trainAPI.update(editingId, formData);
      } else {
        await trainAPI.create(formData);
      }
      await loadTrains();
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError('Failed to save train: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (train) => {
    setFormData(train);
    setEditingId(train._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this train?')) return;

    try {
      setLoading(true);
      await trainAPI.delete(id);
      await loadTrains();
    } catch (err) {
      setError('Failed to delete train: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      trainNumber: '',
      name: '',
      from: '',
      to: '',
      classes: [],
      seats: {},
      fare: {},
    });
    setEditingId(null);
    setError('');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Train Management
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Add, edit, and manage trains</p>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="w-full md:w-auto px-4 py-3 sm:px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>{showForm ? 'Cancel' : 'Add Train'}</span>
          </motion.button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg"
          >
            {error}
            <button onClick={() => setError('')} className="float-right">
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-5 sm:p-8 border-2 border-blue-200"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Plus size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {editingId ? '✏️ Edit Train' : '➕ Add New Train'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">📍 Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Train Number
                    </label>
                    <input
                      type="text"
                      value={formData.trainNumber}
                      onChange={(e) => setFormData({ ...formData, trainNumber: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., 12345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Train Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., Express"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From
                    </label>
                    <input
                      type="text"
                      value={formData.from}
                      onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., Delhi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To
                    </label>
                    <input
                      type="text"
                      value={formData.to}
                      onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                </div>
              </div>

              {/* Classes Selection Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">🚂 Select Classes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {trainClasses.map((cls) => (
                    <label
                      key={cls}
                      className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <input
                        type="checkbox"
                        value={cls}
                        checked={formData.classes.includes(cls)}
                        onChange={handleClassChange}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-blue-600">{cls}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Select all classes available on this train</p>
              </div>

              {/* Classes Details Section */}
              {formData.classes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">💺 Class Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.classes.map((cls) => (
                      <motion.div
                        key={cls}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200 hover:shadow-md transition-all"
                      >
                        <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs rounded-full font-bold">
                            {formData.classes.indexOf(cls) + 1}
                          </span>
                          {cls}
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
                              Number of Seats
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={formData.seats[cls] || 0}
                                onChange={(e) => handleSeatChange(cls, e.target.value)}
                                min="1"
                                className="flex-1 px-3 py-2 bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <span className="text-sm font-semibold text-gray-600">seats</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
                              Fare (₹)
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">₹</span>
                              <input
                                type="number"
                                value={formData.fare[cls] || 0}
                                onChange={(e) => handleFareChange(cls, e.target.value)}
                                min="1"
                                className="flex-1 px-3 py-2 bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Train' : 'Add Train'}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Trains List */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Available Trains</h2>
            <p className="text-gray-400 text-sm">Total: {trains.length} trains</p>
          </div>
          {loading && !trains.length ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border border-blue-200"
            >
              <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
                <div className="w-6 h-6 border-3 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading trains...</p>
            </motion.div>
          ) : trains.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300"
            >
              <div className="inline-block p-4 bg-gray-200 rounded-full mb-4">
                <Plus className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-600 font-medium mb-2">No trains added yet</p>
              <p className="text-gray-500 text-sm">Click "Add Train" to create your first train</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {trains.map((train, index) => (
                <motion.div
                  key={train._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl hover:border-blue-300 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-bold">
                          #{train.trainNumber}
                        </span>
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-semibold">
                          Train
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{train.name}</h3>
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">From</p>
                        <p className="text-lg font-bold text-gray-900">{train.from}</p>
                      </div>
                      <div className="text-center px-3">
                        <div className="text-2xl text-blue-600">→</div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 mb-1">To</p>
                        <p className="text-lg font-bold text-gray-900">{train.to}</p>
                      </div>
                    </div>
                  </div>

                  {/* Classes */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Available Classes</p>
                    <div className="flex flex-wrap gap-2">
                      {train.classes && train.classes.map((cls, idx) => {
                        const colors = [
                          'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700',
                          'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700',
                          'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700',
                          'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700',
                          'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700',
                          'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700',
                        ];
                        return (
                          <span
                            key={cls}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[idx % colors.length]}`}
                          >
                            {cls}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Seat and Fare Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">Total Seats</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Object.values(train.seats || {}).reduce((a, b) => a + b, 0)}
                      </p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">Classes</p>
                      <p className="text-lg font-bold text-gray-900">{train.classes?.length || 0}</p>
                    </div>
                  </div>

                  {/* Fare Range */}
                  {Object.values(train.fare || {}).length > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-4 border border-green-100">
                      <p className="text-xs text-gray-600 mb-1">Fare Range</p>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{Math.min(...Object.values(train.fare).filter(f => f > 0))} - ₹{Math.max(...Object.values(train.fare))}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(train)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold text-sm transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(train._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 font-semibold text-sm transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAddTrain;
