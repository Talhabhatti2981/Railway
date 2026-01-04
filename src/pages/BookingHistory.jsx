import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bookingAPI } from '../utils/api';

const filtersDefault = {
  date: '',
  status: '',
  train: '',
};

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState(filtersDefault);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await bookingAPI.getAll();
        setBookings(data);
      } catch (err) {
        setError('Failed to fetch bookings');
      }
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(b => {
    return (
      (!filters.date || b.date === filters.date) &&
      (!filters.status || b.status === filters.status) &&
      (!filters.train || b.trainName?.toLowerCase().includes(filters.train.toLowerCase()))
    );
  });

  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-2 md:px-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-primary-700">Booking History</h2>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <input
            type="date"
            value={filters.date}
            onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Train Name"
            value={filters.train}
            onChange={e => setFilters(f => ({ ...f, train: e.target.value }))}
            className="border rounded px-3 py-2"
          />
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="border rounded px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {/* Booking List */}
        <AnimatePresence>
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-lg">Loading...</motion.div>
          ) : error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 py-8 text-lg">{error}</motion.div>
          ) : filteredBookings.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-500 py-8 text-lg">No bookings found.</motion.div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((b, i) => (
                <motion.div
                  key={b._id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-lg shadow border flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-primary-50 to-primary-100 hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="font-semibold text-lg text-primary-800">{b.trainName} <span className="text-xs text-gray-500">({b.trainNumber})</span></div>
                    {b.user && (
                      <div className="text-gray-600">Booked By: <span className="font-semibold">{b.user.name || b.user.email || b.user}</span></div>
                    )}
                    <div className="text-gray-600">From: <span className="font-semibold">{b.from}</span></div>
                    <div className="text-gray-600">To: <span className="font-semibold">{b.to}</span></div>
                    <div className="text-gray-600">Date: {b.date}</div>
                    <div className="text-gray-600">Class: <span className="font-semibold">{b.class}</span></div>
                    <div className="text-gray-600">Seat: {b.seat}</div>
                    <div className="text-gray-600">Passenger: <span className="font-semibold">{b.passenger?.name}</span></div>
                    <div className="text-gray-600">Booking ID (PNR): <span className="font-mono">{b.pnr}</span></div>
                    <div className="text-gray-600">Status: <span className={b.status?.toLowerCase() === 'confirmed' ? 'text-green-600' : 'text-red-600'}>{b.status}</span></div>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-2">
                    {/* Add actions if needed */}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BookingHistory;
