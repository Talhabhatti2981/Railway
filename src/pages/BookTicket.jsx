import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, MapPin, User, CheckCircle } from 'lucide-react';
import { trainAPI, bookingAPI, seatAPI } from '../utils/api';
import { formatDate, calculateDuration } from '../utils/helpers';

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
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState('');
  const [seatError, setSeatError] = useState('');

  const handleSearch = async () => {
    if (!searchData.from || !searchData.to || !searchData.date) {
      alert('Please fill all search fields');
      return;
    }
    try {
      const trains = await trainAPI.searchByRoute(searchData.from, searchData.to);
      setAvailableTrains(trains);
    } catch (error) {
      console.error('Error searching trains:', error);
      alert('Error searching trains: ' + (error.message || 'Unknown error'));
    }
  };

  const handleBook = async (train) => {
    setSelectedTrain(train);
    setSelectedSeat('');
    setSeatError('');
    // Fetch available seats for this train/date/class
    if (train && searchData.class && searchData.date) {
      try {
        const seats = await seatAPI.getSeats(train.trainNumber, searchData.date, searchData.class);
        setAvailableSeats(seats.available);
      } catch (err) {
        setAvailableSeats([]);
        setSeatError('Could not load available seats.');
      }
    } else {
      setAvailableSeats([]);
    }
  };

  const handleSubmitBooking = async () => {
    if (!passengerData.name || !passengerData.age || !passengerData.gender || !passengerData.phone) {
      alert('Please fill all passenger details');
      return;
    }
    if (!selectedSeat) {
      setSeatError('Please select a seat');
      return;
    }
    try {
      const booking = {
        trainNumber: selectedTrain.trainNumber,
        trainName: selectedTrain.trainName,
        from: selectedTrain.from,
        to: selectedTrain.to,
        date: searchData.date,
        class: searchData.class,
        seat: selectedSeat,
        passenger: passengerData,
      };
      const savedBooking = await bookingAPI.create(booking);
      setBookingSuccess(savedBooking);
      setShowTicket(true);
      setSelectedTrain(null);
      setPassengerData({ name: '', age: '', gender: '', phone: '', email: '' });
      setSearchData({ from: '', to: '', date: '', class: '' });
      setAvailableTrains([]);
      setAvailableSeats([]);
      setSelectedSeat('');
      setSeatError('');
    } catch (error) {
      setSeatError('Error creating booking: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-2 md:px-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 md:p-10 flex flex-col items-center relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-700 rounded-full px-6 py-2 text-white font-bold text-lg shadow-lg">Book Ticket</div>
          <form className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1">From</label>
              <input
                type="text"
                value={searchData.from}
                onChange={(e) => setSearchData({ ...searchData, from: e.target.value })}
                placeholder="Start location"
                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-blue-50 text-blue-900 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1">To</label>
              <input
                type="text"
                value={searchData.to}
                onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
                placeholder="Destination"
                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-blue-50 text-blue-900 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1">Date of travel</label>
              <input
                type="date"
                value={searchData.date}
                onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-blue-50 text-blue-900 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1">Class</label>
              <select
                value={searchData.class}
                onChange={(e) => setSearchData({ ...searchData, class: e.target.value })}
                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-blue-50 text-blue-900 font-semibold"
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
            <div className="md:col-span-2 flex flex-col md:flex-row gap-4 mt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSearch}
                className="flex-1 px-6 py-3 bg-blue-700 text-white rounded-lg font-bold shadow hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
              >
                <Search className="h-5 w-5" />
                <span>Search Available Trains</span>
              </motion.button>
            </div>
          </form>
          <div className="w-full flex justify-end mt-4">
            <a href="/my-tickets" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">View All My Tickets</a>
          </div>
        </div>
      </motion.div>

      {/* ...existing code for available trains, passenger form, and ticket slip... */}

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

      {/* Passenger Details Form + Seat Selection */}
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
            {/* Seat Selection */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Select Seat</h3>
              {seatError && <div className="text-red-600 mb-2">{seatError}</div>}
              <div className="flex flex-wrap gap-2">
                {availableSeats.length === 0 && <span className="text-gray-500">No seats available</span>}
                {availableSeats.map(seat => (
                  <button
                    key={seat}
                    type="button"
                    className={`px-4 py-2 rounded border font-semibold ${selectedSeat === seat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-blue-100'}`}
                    onClick={() => { setSelectedSeat(seat); setSeatError(''); }}
                  >
                    {seat}
                  </button>
                ))}
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

