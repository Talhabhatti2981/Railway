import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Edit2, Clock, MapPin } from 'lucide-react';
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
    };

    const handleDelete = async (trainNumber) => {
      if (!window.confirm('Delete this train?')) return;
      await trainAPI.delete(trainNumber);
      loadTrains();
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // Convert classes to array of objects with name and totalSeats
        const classObjects = formData.classes.map(cls => ({ name: cls, totalSeats: 20 }));
        const payload = { ...formData, classes: classObjects };
        editingTrain
          ? await trainAPI.update(editingTrain.trainNumber, payload)
          : await trainAPI.create(payload);
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
        alert('Save failed');
      }
    };
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

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
    }
  };

  // Only admin can manage schedules
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Train Schedule</h1>
          <p className="text-gray-600">{isAdmin ? 'Manage train schedules' : 'View train schedules'}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(v => !v)}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg"
          >
            <Plus size={18} />
            {showAddForm ? 'Cancel' : 'Add Train'}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-2">
          <Search size={18} />
          <input
            className="flex-1 border px-4 py-2 rounded"
            placeholder="Search train..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Add/Edit Form (admin only) */}
      {isAdmin && (
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-6 rounded-lg shadow space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                {['trainNumber', 'trainName', 'from', 'to'].map(f => (
                  <input
                    key={f}
                    required
                    disabled={f === 'trainNumber' && editingTrain}
                    placeholder={f}
                    value={formData[f]}
                    onChange={e => setFormData({ ...formData, [f]: e.target.value })}
                    className="border px-4 py-2 rounded"
                  />
                ))}
                <input type="date" required value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="border px-4 py-2 rounded" />
                <input type="time" required value={formData.departureTime}
                  onChange={e => setFormData({ ...formData, departureTime: e.target.value })}
                  className="border px-4 py-2 rounded" />
                <input type="time" required value={formData.arrivalTime}
                  onChange={e => setFormData({ ...formData, arrivalTime: e.target.value })}
                  className="border px-4 py-2 rounded" />
              </div>

              {/* Classes */}
              <div className="flex flex-wrap gap-3">
                {['AC First','AC Second','AC Third','Sleeper','AC Chair Car','Executive'].map(cls => (
                  <label key={cls} className="flex gap-2">
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
                    />
                    {cls}
                  </label>
                ))}
              </div>

              <button className="bg-primary-600 text-white px-6 py-2 rounded">
                {editingTrain ? 'Update' : 'Add'} Train
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      )}

      {/* Train List */}
      {filteredTrains.length === 0 && (
        <div className="bg-white p-8 text-center rounded">
          No trains found
        </div>
      )}

      {filteredTrains.map(train => (
        <div
          key={train.trainNumber}
          className="bg-white p-6 rounded-lg shadow flex justify-between"
        >
          <div>
            <h3 className="text-xl font-bold">
              {train.trainName} #{train.trainNumber}
            </h3>
            <div className="flex gap-6 text-sm mt-2">
              <span><MapPin size={14} /> {train.from} ({train.departureTime})</span>
              <span><MapPin size={14} /> {train.to} ({train.arrivalTime})</span>
              <span>
                <Clock size={14} />{' '}
                {train.departureTime && train.arrivalTime
                  ? calculateDuration(train.departureTime, train.arrivalTime)
                  : '--'}
              </span>
            </div>
            {/* Classes */}
            <div className="flex flex-wrap gap-2 mt-3">
              {train.classes.map((cls, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  {cls}
                </span>
              ))}
            </div>
            {/* Stops */}
            {train.stops.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {train.stops.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {s.station} ({s.time})
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Only admin can edit/delete */}
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(train)}
                className="p-2 bg-blue-500 text-white rounded"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(train.trainNumber)}
                className="p-2 bg-red-500 text-white rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Schedule;
