import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { trainStorage, seatStorage, bookingStorage } from '../utils/localStorage';

const SeatAvailability = () => {
  const [trainNumber, setTrainNumber] = useState('');
  const [date, setDate] = useState('');
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [seatData, setSeatData] = useState(null);
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    if (selectedTrain && date) {
      loadSeatData();
    }
  }, [selectedTrain, date]);

  const loadSeatData = () => {
    // Get bookings for this train and date
    const bookings = bookingStorage.findByTrain(selectedTrain.trainNumber, date);
    const bookedSeats = bookings.map(b => b.seat);

    // Get or initialize seat data
    let seats = seatStorage.getSeats(selectedTrain.trainNumber, date);
    
    if (!seats) {
      // Initialize seats
      const coachList = ['A', 'B', 'C', 'D'];
      const seatsPerCoach = 15;
      const available = [];
      
      coachList.forEach(coach => {
        for (let i = 1; i <= seatsPerCoach; i++) {
          available.push(`${coach}-${i}`);
        }
      });
      
      seats = { booked: [], available };
      seatStorage.setSeats(selectedTrain.trainNumber, date, seats);
    }

    // Update booked seats from bookings
    seats.booked = [...new Set([...seats.booked, ...bookedSeats])];
    seats.available = seats.available.filter(seat => !seats.booked.includes(seat));
    seatStorage.setSeats(selectedTrain.trainNumber, date, seats);

    setSeatData(seats);

    // Organize by coach
    const coachMap = {};
    [...seats.available, ...seats.booked].forEach(seat => {
      const [coach, seatNum] = seat.split('-');
      if (!coachMap[coach]) {
        coachMap[coach] = [];
      }
      coachMap[coach].push({
        number: seatNum,
        full: seat,
        booked: seats.booked.includes(seat),
      });
    });

    const coachList = Object.keys(coachMap).sort().map(coach => ({
      name: coach,
      seats: coachMap[coach].sort((a, b) => parseInt(a.number) - parseInt(b.number)),
    }));

    setCoaches(coachList);
  };

  const handleSearch = () => {
    if (!trainNumber || !date) {
      alert('Please enter train number and date');
      return;
    }

    const trains = trainStorage.getAll();
    const train = trains.find(t => t.trainNumber === trainNumber);

    if (!train) {
      alert('Train not found');
      return;
    }

    setSelectedTrain(train);
  };

  const getSeatStatus = (seat) => {
    if (!seatData) return 'unknown';
    return seatData.booked.includes(seat) ? 'booked' : 'available';
  };

  const availableCount = seatData ? seatData.available.length : 0;
  const bookedCount = seatData ? seatData.booked.length : 0;
  const totalCount = availableCount + bookedCount;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Seat Availability</h1>
        <p className="text-gray-600">Check and manage seat availability</p>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Train Number</label>
            <input
              type="text"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              placeholder="Enter train number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              className="w-full px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 flex items-center justify-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Check Availability</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Train Info & Stats */}
      {selectedTrain && seatData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedTrain.trainName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Available Seats</p>
                    <p className="text-3xl font-bold text-green-600">{availableCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Booked Seats</p>
                    <p className="text-3xl font-bold text-red-600">{bookedCount}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Seats</p>
                    <p className="text-3xl font-bold text-blue-600">{totalCount}</p>
                  </div>
                  <div className="text-2xl">🪑</div>
                </div>
              </div>
            </div>
          </div>

          {/* Seat Map */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Seat Map</h3>
            <div className="space-y-8">
              {coaches.map((coach, coachIndex) => (
                <motion.div
                  key={coach.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: coachIndex * 0.1 }}
                  className="border-2 border-gray-200 rounded-lg p-4"
                >
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Coach {coach.name}</h4>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {coach.seats.map((seat, index) => (
                      <motion.div
                        key={seat.full}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (coachIndex * 0.1) + (index * 0.01) }}
                        whileHover={{ scale: 1.1 }}
                        className={`p-3 rounded-lg text-center font-semibold text-sm cursor-pointer transition-all ${
                          seat.booked
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                        title={seat.booked ? 'Booked' : 'Available'}
                      >
                        {seat.number}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-700">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-700">Booked</span>
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
          <div className="text-6xl mb-4">🪑</div>
          <p className="text-gray-600 text-lg">Enter train number and date to view seat availability</p>
        </motion.div>
      )}
    </div>
  );
};

export default SeatAvailability;

