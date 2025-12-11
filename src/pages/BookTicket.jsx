import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, MapPin, User, CheckCircle } from 'lucide-react';
import { trainStorage, bookingStorage, seatStorage } from '../utils/localStorage';
import { generatePNR, formatDate, calculateDuration } from '../utils/helpers';

const BookTicket = () => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    class: '',
  });
  const [availableTrains, setAvailableTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [passengerData, setPassengerData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
  });
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [showTicket, setShowTicket] = useState(false);

  const handleSearch = () => {
    if (!searchData.from || !searchData.to || !searchData.date) {
      alert('Please fill all search fields');
      return;
    }
    const trains = trainStorage.findByRoute(searchData.from, searchData.to);
    setAvailableTrains(trains);
  };

  const handleBook = (train) => {
    setSelectedTrain(train);
  };

  const handleSubmitBooking = () => {
    if (!passengerData.name || !passengerData.age || !passengerData.gender || !passengerData.phone) {
      alert('Please fill all passenger details');
      return;
    }

    // Get available seats
    const seatData = seatStorage.getSeats(selectedTrain.trainNumber, searchData.date);
    let availableSeats = [];
    
    if (!seatData) {
      // Initialize seats
      const coaches = ['A', 'B', 'C', 'D'];
      coaches.forEach(coach => {
        for (let i = 1; i <= 15; i++) {
          availableSeats.push(`${coach}-${i}`);
        }
      });
    } else {
      availableSeats = seatData.available.filter(seat => !seatData.booked.includes(seat));
    }

    if (availableSeats.length === 0) {
      alert('No seats available');
      return;
    }

    // Assign seat
    const assignedSeat = availableSeats[0];
    
    // Create booking
    const pnr = generatePNR();
    const booking = {
      pnr,
      trainNumber: selectedTrain.trainNumber,
      trainName: selectedTrain.trainName,
      from: selectedTrain.from,
      to: selectedTrain.to,
      date: searchData.date,
      class: searchData.class,
      seat: assignedSeat,
      passenger: passengerData,
      bookingDate: new Date().toISOString(),
      status: 'Confirmed',
    };

    bookingStorage.add(booking);
    seatStorage.bookSeat(selectedTrain.trainNumber, searchData.date, assignedSeat);

    setBookingSuccess(booking);
    setShowTicket(true);
    
    // Reset form
    setSelectedTrain(null);
    setPassengerData({ name: '', age: '', gender: '', phone: '', email: '' });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Book Ticket</h1>
        <p className="text-gray-600">Search and book your train tickets</p>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              From
            </label>
            <input
              type="text"
              value={searchData.from}
              onChange={(e) => setSearchData({ ...searchData, from: e.target.value })}
              placeholder="Source station"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              To
            </label>
            <input
              type="text"
              value={searchData.to}
              onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
              placeholder="Destination station"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date
            </label>
            <input
              type="date"
              value={searchData.date}
              onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              value={searchData.class}
              onChange={(e) => setSearchData({ ...searchData, class: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSearch}
          className="mt-4 w-full md:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Search className="h-5 w-5" />
          <span>Search Trains</span>
        </motion.button>
      </motion.div>

      {/* Available Trains */}
      <AnimatePresence>
        {availableTrains.length > 0 && !selectedTrain && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-800">Available Trains</h2>
            {availableTrains.map((train, index) => (
              <motion.div
                key={train.trainNumber}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{train.trainName}</h3>
                      <span className="text-sm text-gray-500">#{train.trainNumber}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">From</p>
                        <p className="font-semibold">{train.from}</p>
                        <p className="text-primary-600">{train.departureTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">To</p>
                        <p className="font-semibold">{train.to}</p>
                        <p className="text-primary-600">{train.arrivalTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-semibold">{calculateDuration(train.departureTime, train.arrivalTime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Stops</p>
                        <p className="font-semibold">{train.stops.length}</p>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBook(train)}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Book Now
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Passenger Details Form */}
      <AnimatePresence>
        {selectedTrain && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Passenger Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={passengerData.name}
                  onChange={(e) => setPassengerData({ ...passengerData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={passengerData.age}
                  onChange={(e) => setPassengerData({ ...passengerData, age: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={passengerData.gender}
                  onChange={(e) => setPassengerData({ ...passengerData, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={passengerData.phone}
                  onChange={(e) => setPassengerData({ ...passengerData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={passengerData.email}
                  onChange={(e) => setPassengerData({ ...passengerData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div className="mt-6 flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitBooking}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Confirm Booking
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTrain(null)}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Slip */}
      <AnimatePresence>
        {showTicket && bookingSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-xl p-8 border-2 border-primary-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Booking Confirmed!</h2>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="text-sm text-gray-600">PNR Number</p>
                  <p className="text-2xl font-bold text-primary-600">{bookingSuccess.pnr}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-green-600">{bookingSuccess.status}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Train</p>
                  <p className="font-semibold">{bookingSuccess.trainName} (#{bookingSuccess.trainNumber})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-semibold">{formatDate(bookingSuccess.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Route</p>
                  <p className="font-semibold">{bookingSuccess.from} → {bookingSuccess.to}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Class</p>
                  <p className="font-semibold">{bookingSuccess.class}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Seat</p>
                  <p className="font-semibold">{bookingSuccess.seat}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Passenger</p>
                  <p className="font-semibold">{bookingSuccess.passenger.name}</p>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowTicket(false);
                setBookingSuccess(null);
                setSearchData({ from: '', to: '', date: '', class: '' });
                setAvailableTrains([]);
              }}
              className="mt-6 w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Book Another Ticket
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookTicket;

