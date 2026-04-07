import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Train, AlertCircle } from 'lucide-react';
import { trainAPI, trackingAPI } from '../utils/api';

const TrackTrain = () => {
  const [trainNumber, setTrainNumber] = useState('');
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedTrain && trackingData) {
      const interval = setInterval(async () => {
        setPosition(prevPosition => {
          const newPosition = Math.min(prevPosition + 2, 100);
          trackingAPI.updatePosition(selectedTrain.trainNumber, newPosition).catch(console.error);
          return newPosition;
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [selectedTrain, trackingData]);

  const handleSearch = async () => {
    if (!trainNumber) {
      setError('Please enter a train number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const train = await trainAPI.getByNumber(trainNumber);

      if (!train) {
        setError('Train not found. Please check the train number or add trains from Schedule page.');
        setLoading(false);
        return;
      }

      setSelectedTrain(train);

      let trackData;
      try {
        trackData = await trackingAPI.getTracking(trainNumber);
      } catch (error) {
        trackData = await trackingAPI.initialize(trainNumber);
      }

      setTrackingData(trackData);
      setPosition(trackData.currentPosition || 0);
    } catch (error) {
      console.error('Error searching train:', error);
      setError('Error loading train data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStation = () => {
    if (!trackingData) return null;
    const stations = trackingData.route;
    for (let i = stations.length - 1; i >= 0; i--) {
      if (position >= stations[i].distance) {
        return stations[i];
      }
    }
    return stations[0];
  };

  const getNextStation = () => {
    if (!trackingData) return null;
    const stations = trackingData.route;
    for (let i = 0; i < stations.length; i++) {
      if (position < stations[i].distance) {
        return stations[i];
      }
    }
    return stations[stations.length - 1];
  };

  const currentStation = getCurrentStation();
  const nextStation = getNextStation();

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Train size={28} />
            </div>
            Live Train Tracking
          </h1>
          <p className="text-gray-600">Track your train in real-time and get live updates</p>
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

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Search Train</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Train Number</label>
              <input
                type="text"
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., 12345"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Search className="h-5 w-5" />
                <span>{loading ? 'Tracking...' : 'Track'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tracking Display */}
        {selectedTrain && trackingData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Train Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <Train size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTrain.trainName}</h2>
                  <p className="text-gray-600">Train #{selectedTrain.trainNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-xs font-semibold text-gray-700 mb-1 uppercase">Route</p>
                  <p className="text-lg font-bold text-gray-900">{selectedTrain.from} → {selectedTrain.to}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                  <p className="text-xs font-semibold text-gray-700 mb-1 uppercase">Progress</p>
                  <p className="text-lg font-bold text-gray-900">{Math.round(position)}% Complete</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-gray-700 mb-1 uppercase">Status</p>
                  <p className="text-lg font-bold text-gray-900">
                    {position >= 100 ? '✅ Arrived' : '🚂 In Transit'}
                  </p>
                </div>
              </div>
            </div>

            {/* Current & Next Station Cards */}
            {currentStation && nextStation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg p-6 border-2 border-orange-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <MapPin className="text-orange-600" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Current Station</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{currentStation.station}</p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={18} />
                    <p className="text-sm">{currentStation.time}</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-green-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Next Station</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{nextStation.station}</p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={18} />
                    <p className="text-sm">{nextStation.time}</p>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Journey Progress Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Journey Progress</h3>
              <div className="relative">
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${position}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
                  />
                </div>
                <div className="mt-4 flex justify-between text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" />
                    {selectedTrain.from}
                  </span>
                  <span className="text-center text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                    {Math.round(position)}%
                  </span>
                  <span className="flex items-center gap-2">
                    {selectedTrain.to}
                    <MapPin size={16} className="text-blue-600" />
                  </span>
                </div>
              </div>
            </div>

            {/* Route Map Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Complete Route</h3>
              <div className="relative">
                {/* Vertical Route Line */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-300 to-gray-100"></div>
                
                {/* Stations */}
                <div className="relative space-y-6">
                  {trackingData.route.map((station, index) => {
                    const stationPosition = station.distance;
                    const isPassed = position >= stationPosition;
                    const isCurrent = Math.abs(position - stationPosition) < 5;
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-4"
                      >
                        {/* Station Marker */}
                        <div className="relative z-10 flex-shrink-0">
                          <motion.div
                            animate={{
                              scale: isCurrent ? [1, 1.2, 1] : 1,
                            }}
                            transition={{
                              repeat: isCurrent ? Infinity : 0,
                              duration: 1,
                            }}
                            className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                              isPassed
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                : isCurrent
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                                : 'bg-gradient-to-r from-gray-400 to-gray-500'
                            }`}
                          >
                            {isCurrent ? (
                              <Train size={24} />
                            ) : (
                              <span className="text-lg">{index + 1}</span>
                            )}
                          </motion.div>
                        </div>
                        
                        {/* Station Info */}
                        <div className="flex-1 pt-2">
                          <div className={`bg-gradient-to-r rounded-xl p-4 border-2 transition-all ${
                            isPassed
                              ? 'from-green-50 to-emerald-50 border-green-200'
                              : isCurrent
                              ? 'from-blue-50 to-indigo-50 border-blue-300 shadow-md'
                              : 'from-gray-50 to-gray-100 border-gray-200'
                          }`}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="flex-1">
                                <p className={`font-bold text-lg ${
                                  isPassed ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-700'
                                }`}>
                                  {station.station}
                                </p>
                                <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                                  <Clock size={14} />
                                  {station.time}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-600 font-semibold">Distance: {Math.round(station.distance)}%</p>
                                <p className={`font-semibold text-sm mt-1 ${
                                  isPassed ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-600'
                                }`}>
                                  {isPassed ? '✅ Passed' : isCurrent ? '🚂 Current' : '⏳ Upcoming'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!selectedTrain && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg border-2 border-dashed border-gray-300 p-12 text-center"
          >
            <div className="inline-block p-4 bg-gray-200 rounded-full mb-4">
              <Train size={40} className="text-gray-500" />
            </div>
            <p className="text-gray-700 font-medium mb-2 text-lg">No Train Selected</p>
            <p className="text-gray-600">Enter a train number above to start tracking in real-time</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackTrain;

