import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { bookingAPI } from "../utils/api";

const TicketPreview = () => {
  const { id: ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await bookingAPI.getById(ticketId);
        setTicket(data);
      } catch (err) {
        setError("Failed to load ticket details: " + (err.message || "Unknown error"));
        setTicket(null);
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 mt-4">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-100 border border-red-300 text-red-700 px-6 py-8 rounded-2xl text-center max-w-md"
        >
          <p className="font-semibold mb-4">{error || "Ticket not found"}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/my-tickets")}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to My Tickets
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/my-tickets")}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to My Tickets
        </motion.button>

        {/* Ticket Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200"
        >
          <div className="mb-6 p-4 bg-blue-100 rounded-xl border-l-4 border-blue-600">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Ticket Details</h1>
            <p className="text-blue-700 mt-1">PNR: <span className="font-mono font-bold">{ticket.pnr}</span></p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Train Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Train Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Train Name</p>
                  <p className="text-gray-900 font-semibold text-lg">{ticket.trainName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Train Number</p>
                  <p className="text-gray-900 font-semibold">#{ticket.trainNumber}</p>
                </div>
              </div>
            </div>

            {/* Journey Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Journey Details</h2>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-semibold">From</p>
                    <p className="text-gray-900 font-semibold">{ticket.from}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-semibold">To</p>
                    <p className="text-gray-900 font-semibold">{ticket.to}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Information</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Date</p>
                <p className="text-gray-900 font-semibold">{ticket.date}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Class</p>
                <p className="text-gray-900 font-semibold">{ticket.class}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Seat</p>
                <p className="text-blue-600 font-bold text-lg">{ticket.seat}</p>
              </div>
            </div>
          </div>

          {/* Passenger Information */}
          {ticket.passenger && (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Passenger Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Name</p>
                  <p className="text-gray-900 font-semibold">{ticket.passenger.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Age</p>
                  <p className="text-gray-900 font-semibold">{ticket.passenger.age} years</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Gender</p>
                  <p className="text-gray-900 font-semibold">{ticket.passenger.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Phone</p>
                  <p className="text-gray-900 font-semibold">{ticket.passenger.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Status</h2>
            <span
              className="inline-block px-10 py-3 rounded-full font-extrabold text-sm bg-green-500 text-white shadow-md ring-4 ring-green-100 animate-pulse"
            >
              ✓ Ticket Confirmed
            </span>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/my-tickets")}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Back to My Tickets
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default TicketPreview;
