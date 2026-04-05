import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { trainAPI } from '../utils/api';
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
    if (!searchData.from || !searchData.to || !searchData.date) {
      setError('Please fill all search fields');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const trains = await trainAPI.searchByRoute(searchData.from, searchData.to);
      setAvailableTrains(trains);
    } catch (err) {
      console.error('Error searching trains:', err);
      setError('Error searching trains: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (train) => {
    navigate('/booking-detail', { state: { train } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-6 md:py-8 px-3 sm:px-4 md:px-0">
      <div className="max-w-5xl mx-auto">
        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-5 sm:p-8 md:p-10 flex flex-col items-center relative">
            <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 bg-blue-700 rounded-full px-4 py-1 sm:px-6 sm:py-2 text-white font-bold text-base sm:text-lg shadow-lg">
              Book Ticket
            </div>
            
            <form className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div>
                <label className="block text-xs font-bold text-blue-900 mb-1 sm:mb-2">From</label>
                <input
                  type="text"
                  value={searchData.from}
                  onChange={(e) => setSearchData({ ...searchData, from: e.target.value })}
                  placeholder="Start location"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-blue-50 text-blue-900 font-semibold text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-900 mb-1 sm:mb-2">To</label>
                <input
                  type="text"
                  value={searchData.to}
                  onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
                  placeholder="Destination"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-blue-50 text-blue-900 font-semibold text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-900 mb-1 sm:mb-2">Date of travel</label>
                <input
                  type="date"
                  value={searchData.date}
                  onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-blue-50 text-blue-900 font-semibold text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-900 mb-1 sm:mb-2">Class</label>
                <select
                  value={searchData.class}
                  onChange={(e) => setSearchData({ ...searchData, class: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-blue-50 text-blue-900 font-semibold text-sm sm:text-base"
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
              <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleSearch}
                  disabled={loading}
                  className="flex-1 px-4 py-3 sm:px-6 sm:py-3 bg-blue-700 text-white rounded-lg font-bold shadow hover:bg-blue-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Search className="h-5 w-5" />
                  <span>{loading ? 'Searching...' : 'Search Available Trains'}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate('/my-tickets')}
                  className="flex-1 px-4 py-3 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  View My Tickets
                </motion.button>
              </div>
            </form>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 w-full bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Available Trains */}
        <AnimatePresence>
          {availableTrains.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 space-y-4"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                Available Trains ({availableTrains.length})
              </h2>
              {availableTrains.map((train, index) => (
                <motion.div
                  key={train.trainNumber}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-4 sm:p-6"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-2 sm:gap-3 mb-3 flex-wrap">
                        <h3 className="text-lg sm:text-2xl font-bold text-gray-800">{train.trainName}</h3>
                        <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                          #{train.trainNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-gray-600">From</p>
                            <p className="font-semibold text-gray-800 truncate">{train.from}</p>
                            <p className="text-primary-600 text-xs">{train.departureTime}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-gray-600">To</p>
                            <p className="font-semibold text-gray-800 truncate">{train.to}</p>
                            <p className="text-primary-600 text-xs">{train.arrivalTime}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-800">
                            {calculateDuration(train.departureTime, train.arrivalTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Stops</p>
                          <p className="font-semibold text-gray-800">{train.stops?.length || 0} stops</p>
                        </div>
                      </div>
                      {train.classes && train.classes.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {train.classes.map((cls) => (
                            <span
                              key={cls.name || cls}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold"
                            >
                              {cls.name || cls}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBook(train)}
                      className="w-full px-6 py-3 sm:py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md text-sm sm:text-base"
                    >
                      Book Now
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        {!loading && availableTrains.length === 0 && searchData.from && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-white rounded-xl shadow-md p-12 text-center"
          >
            <p className="text-gray-600 text-lg">No trains found. Try different search criteria.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BookTicket;

