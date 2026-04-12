
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { bookingAPI } from "../utils/api";
import { Ticket, Calendar, MapPin, Users, Filter } from "lucide-react";

const MyTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, resolved

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await bookingAPI.getMy();
        setTickets(data || []);
      } catch (err) {
        setError("Failed to load tickets");
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Filter tickets based on status
  const filteredTickets = tickets;

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Ticket className="h-8 w-8" />
            My Tickets
          </h1>
          <p className="text-gray-600">View all your bookings</p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading tickets...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* No Tickets */}
        {!loading && !error && filteredTickets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200"
          >
            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {filter === "all"
                ? "No tickets found"
                : `No ${filter} tickets found`}
            </p>
          </motion.div>
        )}

        {/* Tickets Grid */}
        {!loading && !error && filteredTickets.length > 0 && (
          <div className="grid gap-4">
            {filteredTickets.map((ticket, index) => (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl hover:scale-[1.01] transition-all p-5 sm:p-7"
              >
                <div className="flex flex-col justify-between gap-4">
                  <div className="flex-1">
                    {/* PNR & Status */}
                    <div className="flex flex-wrap items-center gap-2 gap-y-2 mb-3">
                      <span className="font-mono font-bold text-blue-600 text-sm sm:text-base">
                        PNR: {ticket.pnr}
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-extrabold bg-green-500 text-white shadow-sm ring-2 ring-green-200"
                      >
                        ✓ Confirmed
                      </span>
                    </div>

                    {/* Train Info */}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                      {ticket.trainName}{" "}
                      <span className="text-xs sm:text-sm text-gray-500">#{ticket.trainNumber}</span>
                    </h3>

                    {/* Ticket Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {/* From */}
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600 font-semibold">From</p>
                          <p className="font-semibold text-gray-900 truncate">{ticket.from}</p>
                        </div>
                      </div>

                      {/* To */}
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600 font-semibold">To</p>
                          <p className="font-semibold text-gray-900 truncate">{ticket.to}</p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600 font-semibold">Date</p>
                          <p className="font-semibold text-gray-900 text-sm">{ticket.date}</p>
                        </div>
                      </div>

                      {/* Class */}
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Class</p>
                        <p className="font-semibold text-gray-900 text-sm">{ticket.class}</p>
                      </div>

                      {/* Seat */}
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Seat</p>
                        <p className="font-bold text-lg text-blue-600">{ticket.seat}</p>
                      </div>

                      {/* Passenger */}
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600 font-semibold">Passenger</p>
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {ticket.passenger?.name || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Booking Date */}
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Booked</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full flex gap-2 pt-3 border-t border-gray-300">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() =>
                        navigate(`/ticket-preview/${ticket._id}`, { state: { ticket } })
                      }
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                      View Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
