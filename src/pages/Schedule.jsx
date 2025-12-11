import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Edit2, Clock, MapPin } from 'lucide-react';
import { trainStorage } from '../utils/localStorage';
import { calculateDuration } from '../utils/helpers';

const Schedule = () => {
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);
  const [formData, setFormData] = useState({
    trainNumber: '',
    trainName: '',
    from: '',
    to: '',
    departureTime: '',
    arrivalTime: '',
    classes: [],
    stops: [],
  });
  const [newStop, setNewStop] = useState({ station: '', time: '' });

  useEffect(() => {
    loadTrains();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = trains.filter(
        train =>
          train.trainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          train.trainNumber.includes(searchTerm) ||
          train.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
          train.to.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTrains(filtered);
    } else {
      setFilteredTrains(trains);
    }
  }, [searchTerm, trains]);

  const loadTrains = () => {
    const allTrains = trainStorage.getAll();
    setTrains(allTrains);
    setFilteredTrains(allTrains);
  };

  const handleAddStop = () => {
    if (newStop.station && newStop.time) {
      setFormData({
        ...formData,
        stops: [...formData.stops, newStop],
      });
      setNewStop({ station: '', time: '' });
    }
  };

  const handleRemoveStop = (index) => {
    setFormData({
      ...formData,
      stops: formData.stops.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTrain) {
      trainStorage.update(editingTrain.trainNumber, formData);
    } else {
      trainStorage.add(formData);
    }
    loadTrains();
    resetForm();
  };

  const handleEdit = (train) => {
    setEditingTrain(train);
    setFormData({
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      from: train.from,
      to: train.to,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      classes: train.classes || [],
      stops: train.stops || [],
    });
    setShowAddForm(true);
  };

  const handleDelete = (trainNumber) => {
    if (window.confirm('Are you sure you want to delete this train?')) {
      trainStorage.delete(trainNumber);
      loadTrains();
    }
  };

  const resetForm = () => {
    setFormData({
      trainNumber: '',
      trainName: '',
      from: '',
      to: '',
      departureTime: '',
      arrivalTime: '',
      classes: [],
      stops: [],
    });
    setEditingTrain(null);
    setShowAddForm(false);
  };

  const classOptions = ['AC First', 'AC Second', 'AC Third', 'Sleeper', 'AC Chair Car', 'Executive'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Train Schedule</h1>
          <p className="text-gray-600">Manage train schedules and routes</p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>{showAddForm ? 'Cancel' : 'Add Train'}</span>
        </motion.button>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-4"
      >
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search trains by name, number, or route..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </motion.div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingTrain ? 'Edit Train' : 'Add New Train'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Train Number</label>
                  <input
                    type="text"
                    value={formData.trainNumber}
                    onChange={(e) => setFormData({ ...formData, trainNumber: e.target.value })}
                    required
                    disabled={!!editingTrain}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Train Name</label>
                  <input
                    type="text"
                    value={formData.trainName}
                    onChange={(e) => setFormData({ ...formData, trainName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <input
                    type="text"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <input
                    type="text"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departure Time</label>
                  <input
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Arrival Time</label>
                  <input
                    type="time"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Classes</label>
                <div className="flex flex-wrap gap-2">
                  {classOptions.map((cls) => (
                    <label key={cls} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.classes.includes(cls)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, classes: [...formData.classes, cls] });
                          } else {
                            setFormData({ ...formData, classes: formData.classes.filter(c => c !== cls) });
                          }
                        }}
                        className="rounded"
                      />
                      <span>{cls}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stops</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newStop.station}
                    onChange={(e) => setNewStop({ ...newStop, station: e.target.value })}
                    placeholder="Station name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="time"
                    value={newStop.time}
                    onChange={(e) => setNewStop({ ...newStop, time: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add Stop
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.stops.map((stop, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="font-medium">{stop.station} - {stop.time}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
                >
                  {editingTrain ? 'Update Train' : 'Add Train'}
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

      {/* Trains List */}
      <div className="space-y-4">
        {filteredTrains.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-md p-12 text-center"
          >
            <p className="text-gray-600 text-lg">No trains found</p>
          </motion.div>
        ) : (
          filteredTrains.map((train, index) => (
            <motion.div
              key={train.trainNumber}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">{train.trainName}</h3>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                      #{train.trainNumber}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-primary-600" />
                      <div>
                        <p className="text-sm text-gray-600">From</p>
                        <p className="font-semibold">{train.from}</p>
                        <p className="text-primary-600 text-sm">{train.departureTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">To</p>
                        <p className="font-semibold">{train.to}</p>
                        <p className="text-green-600 text-sm">{train.arrivalTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold">{calculateDuration(train.departureTime, train.arrivalTime)}</p>
                      </div>
                    </div>
                  </div>
                  {train.stops && train.stops.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Stops:</p>
                      <div className="flex flex-wrap gap-2">
                        {train.stops.map((stop, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {stop.station} ({stop.time})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Available Classes:</p>
                    <div className="flex flex-wrap gap-2">
                      {train.classes.map((cls, idx) => (
                        <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(train)}
                    className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Edit2 className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(train.trainNumber)}
                    className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Schedule;

