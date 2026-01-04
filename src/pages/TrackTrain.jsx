import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Train } from 'lucide-react';
import { trainAPI, trackingAPI } from '../utils/api';

const TrackTrain = () => {
  const [trainNumber, setTrainNumber] = useState('');
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (selectedTrain && trackingData) {
      const interval = setInterval(async () => {
        setPosition(prevPosition => {
          const newPosition = Math.min(prevPosition + 2, 100);
          // Update position in backend
          trackingAPI.updatePosition(selectedTrain.trainNumber, newPosition).catch(console.error);
          return newPosition;
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [selectedTrain, trackingData]);

  const handleSearch = async () => {
    if (!trainNumber) {
      alert('Please enter a train number');
      return;
    }

    try {
      const train = await trainAPI.getByNumber(trainNumber);

      if (!train) {
        alert('Train not found. Please check the train number or add trains from Schedule page.');
        return;
      }

      setSelectedTrain(train);

      // Get or create tracking data from API
      let trackData;
      try {
        trackData = await trackingAPI.getTracking(trainNumber);
      } catch (error) {
        // If tracking doesn't exist, initialize it
        trackData = await trackingAPI.initialize(trainNumber);
      }

      setTrackingData(trackData);
      setPosition(trackData.currentPosition || 0);
    } catch (error) {
      console.error('Error searching train:', error);
      alert('Error loading train data: ' + (error.message || 'Unknown error'));
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Live Train Tracking</h1>
        <p className="text-gray-600">Track your train in real-time</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Train Number</label>
            <input
              type="text"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              placeholder="Enter train number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 flex items-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Track</span>
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
          {/* Train Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Train className="h-8 w-8 text-primary-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedTrain.trainName}</h2>
                <p className="text-gray-600">Train #{selectedTrain.trainNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Route</p>
                <p className="font-semibold text-lg">{selectedTrain.from} → {selectedTrain.to}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="font-semibold text-lg">{Math.round(position)}% Complete</p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          {currentStation && nextStation && (
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-md p-6 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm opacity-90 mb-1">Current Station</p>
                  <p className="text-2xl font-bold">{currentStation.station}</p>
                  <p className="text-sm opacity-90 mt-1">{currentStation.time}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90 mb-1">Next Station</p>
                  <p className="text-2xl font-bold">{nextStation.station}</p>
                  <p className="text-sm opacity-90 mt-1">{nextStation.time}</p>
                </div>
              </div>
            </div>
          )}

          {/* Route Map */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Route Map</h3>
            <div className="relative">
              {/* Route Line */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200"></div>
              
              {/* Stations */}
              <div className="relative space-y-8">
                {trackingData.route.map((station, index) => {
                  const stationPosition = station.distance;
                  const isPassed = position >= stationPosition;
                  const isCurrent = Math.abs(position - stationPosition) < 5;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4"
                    >
                      {/* Station Marker */}
                      <div className="relative z-10">
                        <motion.div
                          animate={{
                            scale: isCurrent ? [1, 1.2, 1] : 1,
                          }}
                          transition={{
                            repeat: isCurrent ? Infinity : 0,
                            duration: 1,
                          }}
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            isPassed
                              ? 'bg-green-500'
                              : isCurrent
                              ? 'bg-primary-600'
                              : 'bg-gray-300'
                          } shadow-lg`}
                        >
                          {isCurrent ? (
                            <Train className="h-8 w-8 text-white" />
                          ) : (
                            <MapPin className="h-6 w-6 text-white" />
                          )}
                        </motion.div>
                      </div>
                      
                      {/* Station Info */}
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className={`font-semibold text-lg ${isPassed ? 'text-green-600' : isCurrent ? 'text-primary-600' : 'text-gray-600'}`}>
                              {station.station}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              <Clock className="inline h-4 w-4 mr-1" />
                              {station.time}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Distance</p>
                            <p className="font-semibold">{Math.round(station.distance)}%</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Journey Progress</h3>
            <div className="relative">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${position}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                />
              </div>
              <div className="mt-2 flex justify-between text-sm text-gray-600">
                <span>{selectedTrain.from}</span>
                <span>{selectedTrain.to}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {!selectedTrain && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-md p-12 text-center"
        >
          <Train className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Enter a train number to start tracking</p>
        </motion.div>
      )}
    </div>
  );
};

export default TrackTrain;

