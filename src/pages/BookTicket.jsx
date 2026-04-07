import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import { trainAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { calculateDuration } from '../utils/helpers';

const BookTicket = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    class: '',
  });
  const [availableTrains, setAvailableTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchData.from || !searchData.to || !searchData.date || !searchData.class) {
      setError('Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const trains = await trainAPI.searchByRoute(searchData.from, searchData.to);
      setAvailableTrains(trains);
    } catch (err) {
      setError('Error searching trains: ' + (err.message || 'Unknown error'));
      setAvailableTrains([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookTrain = (train) => {
    navigate('/booking-form', {
      state: {
        train,
        searchData,
      },
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Book Ticket</h1>
          <p className="text-gray-600">Search and select trains</p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Search Trains</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <input
                  type="text"
                  value={searchData.from}
                  onChange={(e) => setSearchData({ ...searchData, from: e.target.value })}
                  placeholder="Start location"
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <input
                  type="text"
                  value={searchData.to}
                  onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
                  placeholder="Destination"
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={searchData.date}
                  onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select
                  value={searchData.class}
                  onChange={(e) => setSearchData({ ...searchData, class: e.target.value })}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Class</option>
                  <option value="AC First">AC First</option>
                  <option value="AC Second">AC Second</option>
                  <option value="AC Third">AC Third</option>
                  <option value="Sleeper">Sleeper</option>
                  <option value="AC Chair Car">AC Chair Car</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="h-5 w-5" />
              {loading ? 'Searching...' : 'Search Available Trains'}
            </motion.button>
          </form>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Available Trains */}
        <AnimatePresence>
          {availableTrains.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Available Trains</h2>
              {availableTrains.map((train, index) => (
                <motion.div
                  key={train._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all p-5 sm:p-7"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{train.name || train.trainName}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-semibold">
                          #{train.trainNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span className="font-semibold">{train.from}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-semibold">{train.to}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {train.departureTime && (
                          <span>Departs: {train.departureTime}</span>
                        )}
                        {train.arrivalTime && (
                          <span>Arrives: {train.arrivalTime}</span>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBookTrain(train)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Book Ticket
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        {!loading && availableTrains.length === 0 && !error && searchData.from && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-8 text-center border border-gray-200"
          >
            <p className="text-gray-600">No trains found. Try different search criteria.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BookTicket;

