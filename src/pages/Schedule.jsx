import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Edit2, Clock, MapPin, Train, AlertCircle, CheckCircle } from 'lucide-react';
import { trainAPI, userAPI } from '../utils/api';
import { calculateDuration } from '../utils/helpers';

const normalizeArray = (value, validator = () => true) => {
  if (Array.isArray(value)) return value.filter(validator);
  if (value && typeof value === 'object')
    return Object.values(value).filter(validator);
  return [];
};

const normalizeTrain = (train) => ({
  ...train,
  trainNumber: String(train.trainNumber || ''),
  trainName: String(train.trainName || ''),
  from: String(train.from || ''),
  to: String(train.to || ''),
  departureTime: String(train.departureTime || ''),
  arrivalTime: String(train.arrivalTime || ''),
  classes: normalizeArray(train.classes, v => typeof v === 'string'),
  stops: normalizeArray(train.stops, s => s?.station && s?.time),
});

const Schedule = () => {
    // Form state for add/edit
    const [formData, setFormData] = useState({
      trainNumber: '',
      trainName: '',
      from: '',
      to: '',
      date: '',
      departureTime: '',
      arrivalTime: '',
      classes: [],
      stops: [],
    });
    const [editingTrain, setEditingTrain] = useState(null);
    const [trains, setTrains] = useState([]);
    const [filteredTrains, setFilteredTrains] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [user, setUser] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Add/Edit logic
    const handleEdit = (train) => {
      setEditingTrain(train);
      setFormData({
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        from: train.from,
        to: train.to,
        date: train.date || '',
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        classes: train.classes,
        stops: train.stops,
      });
      setShowAddForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (trainNumber) => {
      if (!window.confirm('Are you sure you want to delete this train?')) return;
      try {
        setLoading(true);
        await trainAPI.delete(trainNumber);
        await loadTrains();
        setError('');
      } catch (err) {
        setError('Failed to delete train');
      } finally {
        setLoading(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setLoading(true);
        setError('');
        
        if (!formData.trainNumber || !formData.trainName || !formData.from || !formData.to || !formData.departureTime || !formData.arrivalTime) {
          setError('Please fill all required fields');
          return;
        }

        // Convert classes to array of objects with name and totalSeats
        const classObjects = formData.classes.map(cls => ({ name: cls, totalSeats: 20 }));
        const payload = { ...formData, classes: classObjects };
        
        if (editingTrain) {
          await trainAPI.update(editingTrain.trainNumber, payload);
        } else {
          await trainAPI.create(payload);
        }
        
        await loadTrains();
        setFormData({
          trainNumber: '',
          trainName: '',
          from: '',
          to: '',
          date: '',
          departureTime: '',
          arrivalTime: '',
          classes: [],
          stops: [],
        });
        setEditingTrain(null);
        setShowAddForm(false);
      } catch (err) {
        setError('Failed to save train: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

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
    loadTrains();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredTrains(trains);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFilteredTrains(
      trains.filter(t =>
        t.trainName.toLowerCase().includes(term) ||
        t.trainNumber.includes(searchTerm) ||
        t.from.toLowerCase().includes(term) ||
        t.to.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, trains]);

  const loadTrains = async () => {
    try {
      setLoading(true);
      const data = await trainAPI.getAll();
      const safeData = Array.isArray(data)
        ? data.map(normalizeTrain)
        : [];
      setTrains(safeData);
      setFilteredTrains(safeData);
    } catch (err) {
      console.error(err);
      setTrains([]);
      setFilteredTrains([]);
    } finally {
      setLoading(false);
    }
  };

  // Only admin can manage schedules
  const isAdmin = user && user.role === 'admin';

  const trainClasses = ['AC First','AC Second','AC Third','Sleeper','AC Chair Car','Executive'];

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <Train size={28} />
              </div>
              Train Schedule
            </h1>
            <p className="text-gray-600">{isAdmin ? 'Manage train schedules' : 'View train schedules'} • {trains.length} total trains</p>
          </div>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowAddForm(v => !v);
                setError('');
                if (showAddForm) {
                  setFormData({
                    trainNumber: '',
                    trainName: '',
                    from: '',
                    to: '',
                    date: '',
                    departureTime: '',
                    arrivalTime: '',
                    classes: [],
                    stops: [],
                  });
                  setEditingTrain(null);
                }
              }}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              <Plus size={20} />
              {showAddForm ? 'Cancel' : 'Add Train Schedule'}
            </motion.button>
          )}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
        >
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
              placeholder="Search by train name, number, origin, or destination..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Add/Edit Form (admin only) */}
        {isAdmin && (
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-blue-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Train size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingTrain ? '✏️ Edit Train Schedule' : '➕ Add New Train Schedule'}
                  </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Basic Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Train Number *</label>
                        <input
                          type="text"
                          required
                          disabled={editingTrain}
                          placeholder="e.g., 12345"
                          value={formData.trainNumber}
                          onChange={e => setFormData({ ...formData, trainNumber: e.target.value })}
                          className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Train Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Express"
                          value={formData.trainName}
                          onChange={e => setFormData({ ...formData, trainName: e.target.value })}
                          className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">From *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Delhi"
                          value={formData.from}
                          onChange={e => setFormData({ ...formData, from: e.target.value })}
                          className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">To *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Mumbai"
                          value={formData.to}
                          onChange={e => setFormData({ ...formData, to: e.target.value })}
                          className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Time & Date Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Schedule</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <input 
                          type="date" 
                          value={formData.date}
                          onChange={e => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Departure Time *</label>
                        <input 
                          type="time" 
                          required
                          value={formData.departureTime}
                          onChange={e => setFormData({ ...formData, departureTime: e.target.value })}
                          className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Arrival Time *</label>
                        <input 
                          type="time" 
                          required
                          value={formData.arrivalTime}
                          onChange={e => setFormData({ ...formData, arrivalTime: e.target.value })}
                          className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Classes Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Available Classes</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {trainClasses.map(cls => (
                        <label key={cls} className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                          <input
                            type="checkbox"
                            checked={formData.classes.includes(cls)}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                classes: e.target.checked
                                  ? [...prev.classes, cls]
                                  : prev.classes.filter(c => c !== cls),
                              }))
                            }
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">{cls}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      {loading ? 'Saving...' : (editingTrain ? 'Update Train' : 'Add Train')}
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingTrain(null);
                        setFormData({
                          trainNumber: '',
                          trainName: '',
                          from: '',
                          to: '',
                          date: '',
                          departureTime: '',
                          arrivalTime: '',
                          classes: [],
                          stops: [],
                        });
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Train List */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {filteredTrains.length > 0 ? `📋 All Trains (${filteredTrains.length})` : '🚂 No Trains Found'}
            </h2>
          </div>

          {loading && filteredTrains.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl p-12 text-center shadow-md border border-gray-200"
            >
              <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading trains...</p>
            </motion.div>
          ) : filteredTrains.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center"
            >
              <div className="inline-block p-4 bg-gray-200 rounded-full mb-4">
                <Train size={32} className="text-gray-500" />
              </div>
              <p className="text-gray-700 font-medium mb-2">No trains found</p>
              <p className="text-gray-600 text-sm">{searchTerm ? 'Try adjusting your search' : 'Create your first train schedule'}</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTrains.map((train, index) => (
                <motion.div
                  key={train.trainNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-gray-200 hover:border-blue-300 transition-all overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-bold">
                          #{train.trainNumber}
                        </span>
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-semibold">
                          Schedule
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{train.trainName}</h3>
                    </div>
                  </div>

                  {/* Route Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">FROM</p>
                        <p className="text-lg font-bold text-gray-900">{train.from}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <MapPin className="text-blue-600 mb-1" size={20} />
                        <p className="text-xs text-gray-500">route</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-600 mb-1">TO</p>
                        <p className="text-lg font-bold text-gray-900">{train.to}</p>
                      </div>
                    </div>
                  </div>

                  {/* Time Info */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-100">
                      <p className="text-xs text-gray-600 mb-1">Departs</p>
                      <p className="text-sm font-bold text-gray-900 flex items-center justify-center gap-1">
                        <Clock size={14} className="text-orange-600" />
                        {train.departureTime}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                      <p className="text-xs text-gray-600 mb-1">Arrives</p>
                      <p className="text-sm font-bold text-gray-900 flex items-center justify-center gap-1">
                        <Clock size={14} className="text-green-600" />
                        {train.arrivalTime}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
                      <p className="text-xs text-gray-600 mb-1">Duration</p>
                      <p className="text-sm font-bold text-gray-900">
                        {train.departureTime && train.arrivalTime
                          ? calculateDuration(train.departureTime, train.arrivalTime)
                          : '--'}
                      </p>
                    </div>
                  </div>

                  {/* Classes */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Available Classes</p>
                    <div className="flex flex-wrap gap-2">
                      {train.classes.map((cls, i) => {
                        const colors = [
                          'bg-emerald-100 text-emerald-700',
                          'bg-blue-100 text-blue-700',
                          'bg-orange-100 text-orange-700',
                          'bg-purple-100 text-purple-700',
                          'bg-pink-100 text-pink-700',
                          'bg-indigo-100 text-indigo-700',
                        ];
                        return (
                          <span
                            key={i}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[i % colors.length]}`}
                          >
                            {cls}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stops */}
                  {train.stops && train.stops.length > 0 && (
                    <div className="mb-4 pb-4 border-t border-gray-200 pt-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Stops</p>
                      <div className="flex flex-wrap gap-2">
                        {train.stops.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs border border-yellow-200">
                            {s.station} ({s.time})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions - Only admin can see */}
                  {isAdmin && (
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(train)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                      >
                        <Edit2 size={16} />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(train.trainNumber)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
                      >
                        <Trash2 size={16} />
                        Delete
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Schedule;
