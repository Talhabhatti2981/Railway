import React from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";

const TicketPreview = ({ booking, onBack }) => {
  if (!booking) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 mt-10 relative">
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-700 rounded-full px-6 py-2 text-white font-bold text-lg shadow-lg">Ticket Preview</div>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-2">
          <div className="text-xl font-bold text-blue-800 dark:text-blue-200">{booking.trainName} <span className="text-sm text-gray-500">({booking.trainNumber})</span></div>
          <div className="text-gray-700 dark:text-gray-200">From: <span className="font-semibold">{booking.from}</span></div>
          <div className="text-gray-700 dark:text-gray-200">To: <span className="font-semibold">{booking.to}</span></div>
          <div className="text-gray-700 dark:text-gray-200">Date: <span className="font-semibold">{booking.date}</span></div>
          <div className="text-gray-700 dark:text-gray-200">Class: <span className="font-semibold">{booking.class}</span></div>
          <div className="text-gray-700 dark:text-gray-200">Seat: <span className="font-semibold">{booking.seat}</span></div>
          <div className="text-gray-700 dark:text-gray-200">Passenger: <span className="font-semibold">{booking.passenger?.name}</span></div>
          <div className="text-gray-700 dark:text-gray-200">Booking ID: <span className="font-mono font-semibold">{booking._id || 'N/A'}</span></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <QRCode value={JSON.stringify(booking)} size={96} bgColor="#fff" fgColor="#1e293b" />
          <span className="text-xs text-gray-400">Scan for details</span>
        </div>
      </div>
      <button onClick={onBack} className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all">Back to Booking</button>
    </motion.div>
  );
};

export default TicketPreview;
