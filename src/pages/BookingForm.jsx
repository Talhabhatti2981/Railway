import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI, seatAPI } from '../utils/api';
import { User, Phone, Mail, ChevronLeft, CheckCircle } from 'lucide-react';

const BookingForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { train, searchData } = location.state || {};

  const [passengerData, setPassengerData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
  });
  const [selectedSeat, setSelectedSeat] = useState('');
  const [availableSeats, setAvailableSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    if (!train || !searchData) {
      navigate('/book-ticket');
      return;
    }

    const loadSeats = async () => {
      try {
        setLoading(true);
        const seats = await seatAPI.getSeats(
          train.trainNumber,
          searchData.date,
          searchData.class
        );
        setAvailableSeats(seats.available || []);
      } catch (err) {
        setError('Could not load available seats: ' + (err.message || 'Unknown error'));
        setAvailableSeats([]);
      } finally {
        setLoading(false);
      }
    };

    loadSeats();
  }, [train, searchData, navigate]);

  const handleSubmitBooking = async () => {
    if (!passengerData.name || !passengerData.age || !passengerData.gender || !passengerData.phone) {
      setError('Please fill all required passenger details');
      return;
    }
    if (!selectedSeat) {
      setError('Please select a seat');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const booking = {
        trainNumber: train.trainNumber,
        trainName: train.name || train.trainName,
        from: train.from,
        to: train.to,
        date: searchData.date,
        class: searchData.class,
        seat: selectedSeat,
        passenger: passengerData,
        status: "CONFIRMED",
      };

      const savedBooking = await bookingAPI.create(booking);
      setBookingData(savedBooking);
      setBookingSuccess(true);
    } catch (err) {
      setError('Error creating booking: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!train || !searchData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-400">Invalid booking request</p>
      </div>
    );
  }

  if (bookingSuccess && bookingData) {
    return (
      <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-6">Your ticket has been successfully booked</p>

            <div className="bg-gray-100 rounded-lg p-6 text-left space-y-3 mb-6">
              <div>
                <p className="text-gray-600 text-sm">PNR Number</p>
                <p className="text-gray-900 font-bold text-lg">{bookingData.pnr}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Train</p>
                  <p className="text-gray-900 font-semibold">{train.name || train.trainName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Seat</p>
                  <p className="text-gray-900 font-semibold text-lg">{selectedSeat}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Date</p>
                  <p className="text-gray-900 font-semibold">{searchData.date}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Class</p>
                  <p className="text-gray-900 font-semibold">{searchData.class}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/my-tickets')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View My Tickets
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/book-ticket')}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Book Another Ticket
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/book-ticket')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Search
        </motion.button>

        {/* Train Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Train Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Train</p>
              <p className="text-gray-900 font-semibold">{train.name || train.trainName}</p>
            </div>
            <div>
              <p className="text-gray-600">Route</p>
              <p className="text-gray-900 font-semibold">{train.from} → {train.to}</p>
            </div>
            <div>
              <p className="text-gray-600">Date</p>
              <p className="text-gray-900 font-semibold">{searchData.date}</p>
            </div>
            <div>
              <p className="text-gray-600">Class</p>
              <p className="text-gray-900 font-semibold">{searchData.class}</p>
            </div>
          </div>
        </motion.div>

        {/* Passenger Details Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Passenger Details</h2>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={passengerData.name}
                onChange={(e) => setPassengerData({ ...passengerData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={passengerData.age}
                  onChange={(e) => setPassengerData({ ...passengerData, age: e.target.value })}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Age"
                  min="1"
                  max="120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={passengerData.gender}
                  onChange={(e) => setPassengerData({ ...passengerData, gender: e.target.value })}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={passengerData.phone}
                onChange={(e) => setPassengerData({ ...passengerData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Your phone number"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email (Optional)
              </label>
              <input
                type="email"
                value={passengerData.email}
                onChange={(e) => setPassengerData({ ...passengerData, email: e.target.value })}
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Your email address"
              />
            </div>
          </div>
        </motion.div>

        {/* Seat Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Select Your Seat</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
              <p className="text-gray-600 mt-4">Loading available seats...</p>
            </div>
          ) : availableSeats.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No seats available for this train and date</p>
          ) : (
            <>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
                {availableSeats.map((seat) => (
                  <motion.button
                    key={seat}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSeat(seat)}
                    className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                      selectedSeat === seat
                        ? 'bg-blue-600 text-white border-2 border-blue-400'
                        : 'bg-gray-200 text-gray-700 border-2 border-gray-300 hover:bg-gray-300'
                    }`}
                  >
                    {seat}
                  </motion.button>
                ))}
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Selected Seat: <span className="font-bold text-blue-400">{selectedSeat || 'None'}</span>
              </p>
            </>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmitBooking}
          disabled={loading || !selectedSeat}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Completing Booking...' : 'Confirm & Book Ticket'}
        </motion.button>
      </div>
    </div>
  );
};

export default BookingForm;
