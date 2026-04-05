import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, CheckCircle, MapPin, Calendar } from 'lucide-react';
import { bookingAPI, seatAPI } from '../utils/api';

const BookingDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const train = location.state?.train;

  const [passengerData, setPassengerData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
  });
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState('');
  const [seatError, setSeatError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!train) {
      navigate('/book-ticket');
    }
  }, [train, navigate]);

  const handleClassDateChange = async () => {
    if (!selectedClass || !selectedDate || !train) return;
    
    try {
      setLoading(true);
      const seats = await seatAPI.getSeats(train.trainNumber, selectedDate, selectedClass);
      setAvailableSeats(seats.available);
      setSelectedSeat('');
      setSeatError('');
    } catch (err) {
      setAvailableSeats([]);
      setSeatError('Could not load available seats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleClassDateChange();
  }, [selectedClass, selectedDate]);

  const handleSubmitBooking = async () => {
    if (!passengerData.name || !passengerData.age || !passengerData.gender || !passengerData.phone) {
      setSeatError('Please fill all passenger details');
      return;
    }
    if (!selectedSeat) {
      setSeatError('Please select a seat');
      return;
    }

    try {
      setLoading(true);
      const booking = {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        from: train.from,
        to: train.to,
        date: selectedDate,
        class: selectedClass,
        seat: selectedSeat,
        passenger: passengerData,
      };
      const savedBooking = await bookingAPI.create(booking);
      setBookingSuccess(savedBooking);
      setShowTicket(true);
    } catch (error) {
      setSeatError('Error creating booking: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!train) return null;

  return (
    <div className="min-h-screen bg-slate-900 py-6 md:py-8 px-3 sm:px-4 md:px-0">
      <div className="max-w-3xl mx-auto">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/book-ticket')}
            className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-sm sm:text-base font-medium"
          >
            ← Back
          </motion.button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900">Complete Your Booking</h1>
        </motion.div>

        {!showTicket ? (
          <>
            {/* Train Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border-2 border-blue-100"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Train Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 font-semibold">From</p>
                    <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{train.from}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-xl sm:text-2xl text-blue-600">→</div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 font-semibold">To</p>
                    <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{train.to}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-base sm:text-lg font-bold text-blue-700">{train.trainName} (#{train.trainNumber})</p>
              </div>
            </motion.div>

            {/* Date & Class Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Select Date & Class</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Travel Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2 sm:py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 font-semibold text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-2 sm:py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 font-semibold text-sm sm:text-base"
                  >
                    <option value="">Select Class</option>
                    {train.classes && train.classes.map((cls) => (
                      <option key={cls.name || cls} value={cls.name || cls}>
                        {cls.name || cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Passenger Details Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Passenger Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={passengerData.name}
                    onChange={(e) => setPassengerData({ ...passengerData, name: e.target.value })}
                    className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                  <input
                    type="number"
                    value={passengerData.age}
                    onChange={(e) => setPassengerData({ ...passengerData, age: e.target.value })}
                    className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                    placeholder="Enter age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    value={passengerData.gender}
                    onChange={(e) => setPassengerData({ ...passengerData, gender: e.target.value })}
                    className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={passengerData.phone}
                    onChange={(e) => setPassengerData({ ...passengerData, phone: e.target.value })}
                    className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={passengerData.email}
                    onChange={(e) => setPassengerData({ ...passengerData, email: e.target.value })}
                    className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </motion.div>

            {/* Seat Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Select Seat</h2>
              {seatError && !showTicket && <div className="text-red-600 mb-4 font-semibold text-sm sm:text-base">{seatError}</div>}
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {availableSeats.length === 0 ? (
                    <span className="text-gray-500 text-center w-full py-4 text-sm sm:text-base">
                      {selectedClass && selectedDate ? 'No seats available' : 'Select date and class first'}
                    </span>
                  ) : (
                    availableSeats.map((seat) => (
                      <motion.button
                        key={seat}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedSeat(seat);
                          setSeatError('');
                        }}
                        className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg border-2 font-bold transition-all text-sm sm:text-base ${
                          selectedSeat === seat
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                            : 'bg-white text-gray-800 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {seat}
                      </motion.button>
                    ))
                  )}
                </div>
              )}
            </motion.div>

            {/* Confirm Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitBooking}
                disabled={loading}
                className="flex-1 px-4 py-3 sm:px-6 sm:py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 text-sm sm:text-base"
              >
                {loading ? 'Processing...' : 'Confirm & Book Ticket'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/book-ticket')}
                className="flex-1 px-4 py-3 sm:px-6 sm:py-4 bg-gray-300 text-gray-800 rounded-lg font-bold hover:bg-gray-400 transition-colors text-sm sm:text-base"
              >
                Cancel
              </motion.button>
            </motion.div>
          </>
        ) : (
          /* Booking Confirmation Card */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-t-3xl shadow-2xl p-6 sm:p-8 text-white">
              <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm font-semibold mb-1">BOOKING CONFIRMED</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold">✓ Ticket Booked</p>
                </div>
                <CheckCircle className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-green-300 flex-shrink-0" />
              </div>
            </motion.div>

            <motion.div className="bg-white rounded-b-3xl shadow-2xl p-5 sm:p-8 space-y-6">
              {/* PNR & Status */}
              <div className="border-b-2 border-gray-200 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">PNR Number</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-700 font-mono">{bookingSuccess.pnr}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Status</p>
                    <p className="text-lg sm:text-xl font-bold text-green-600">{bookingSuccess.status || "PENDING"}</p>
                  </div>
                </div>
              </div>

              {/* Train & Journey Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-xs sm:text-sm font-bold text-gray-600 uppercase mb-3">Journey Details</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">From</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-800">{bookingSuccess.from}</p>
                  </div>
                  <div className="flex items-end justify-center pb-1 sm:pb-2">
                    <span className="text-lg sm:text-2xl text-blue-600">→</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">To</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-800">{bookingSuccess.to}</p>
                  </div>
                </div>
              </div>

              {/* Train Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-xs sm:text-sm font-bold text-gray-600 uppercase mb-3">Train Information</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Train Name</p>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">{bookingSuccess.trainName}</p>
                    <p className="text-xs text-gray-500">#{bookingSuccess.trainNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Date</p>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">{bookingSuccess.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Class</p>
                    <p className="font-bold text-blue-700 text-base sm:text-lg">{bookingSuccess.class}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Seat</p>
                    <p className="font-bold text-blue-700 text-base sm:text-lg">{bookingSuccess.seat}</p>
                  </div>
                </div>
              </div>

              {/* Passenger Details */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <h3 className="text-xs sm:text-sm font-bold text-gray-600 uppercase mb-3">Passenger Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Name</p>
                    <p className="font-bold text-gray-800">{bookingSuccess.passenger.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Age</p>
                    <p className="font-bold text-gray-800">{bookingSuccess.passenger.age} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Gender</p>
                    <p className="font-bold text-gray-800">{bookingSuccess.passenger.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Phone</p>
                    <p className="font-bold text-gray-800">{bookingSuccess.passenger.phone}</p>
                  </div>
                </div>
                {bookingSuccess.passenger.email && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-xs text-gray-600 font-semibold">Email</p>
                    <p className="font-semibold text-gray-800">{bookingSuccess.passenger.email}</p>
                  </div>
                )}
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 rounded">
                <p className="text-xs sm:text-sm text-yellow-800">
                  <span className="font-bold">Important:</span> Please save your PNR number. You'll need it to manage your booking.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/my-tickets')}
                  className="w-full px-4 py-3 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  View All My Tickets
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/book-ticket')}
                  className="w-full px-4 py-3 sm:px-6 sm:py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base"
                >
                  Book Another Ticket
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BookingDetail;
