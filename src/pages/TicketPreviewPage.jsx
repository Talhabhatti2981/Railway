import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { bookingAPI } from "../utils/api";
import { Ticket, Calendar, MapPin, Users, ArrowLeft, Download, Share2 } from "lucide-react";
import QRCode from "react-qr-code";

const TicketPreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [ticket, setTicket] = useState(location.state?.ticket || null);
  const [loading, setLoading] = useState(!ticket);

  useEffect(() => {
    if (!ticket) {
      const fetchTicket = async () => {
        try {
          setLoading(true);
          const data = await bookingAPI.getById(id);
          setTicket(data);
        } catch (error) {
          console.error("Error fetching ticket:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTicket();
    }
  }, [id, ticket]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8">
          <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Ticket not found</p>
          <button
            onClick={() => navigate("/my-tickets")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to My Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-6 md:py-8 px-3 sm:px-4 md:px-0">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/my-tickets")}
            className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-all"
          >
            <ArrowLeft className="h-6 w-6 text-blue-600" />
          </motion.button>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900">Ticket Details</h1>
        </motion.div>

        {/* Main Ticket Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-blue-100 text-sm font-semibold mb-1">PNR NUMBER</p>
                <p className="text-2xl md:text-3xl font-bold font-mono">{ticket.pnr}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm font-semibold mb-1">BOOKING STATUS</p>
                <p
                  className={`text-xl font-bold ${
                    ticket.status === "RESOLVED"
                      ? "text-green-300"
                      : ticket.status === "PENDING"
                      ? "text-yellow-300"
                      : "text-gray-300"
                  }`}
                >
                  {ticket.status || "PENDING"}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Journey Info */}
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-4">Journey Details</h2>
              <div className="bg-blue-50 rounded-2xl p-4 md:p-6 border-2 border-blue-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-semibold mb-1">From</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-900">{ticket.from}</p>
                  </div>
                  <div className="text-3xl md:text-4xl text-blue-600">→</div>
                  <div className="flex-1 text-right">
                    <p className="text-sm text-gray-600 font-semibold mb-1">To</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-900">{ticket.to}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Train Info */}
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-4">Train Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-2">TRAIN NAME</p>
                  <p className="font-bold text-gray-800">{ticket.trainName}</p>
                  <p className="text-xs text-gray-500 mt-1">#{ticket.trainNumber}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-2">Date</p>
                  <p className="font-bold text-lg text-blue-700">{ticket.date}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-2">Class</p>
                  <p className="font-bold text-lg text-blue-700">{ticket.class}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <p className="text-xs text-gray-600 font-semibold mb-2">SEAT NUMBER</p>
                  <p className="font-bold text-2xl text-blue-900">{ticket.seat}</p>
                </div>
              </div>
            </div>

            {/* Passenger Info */}
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-4">Passenger Details</h2>
              <div className="bg-green-50 rounded-2xl p-4 md:p-6 border-2 border-green-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Name</p>
                      <p className="font-bold text-gray-800 text-lg">{ticket.passenger?.name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Age</p>
                    <p className="font-bold text-gray-800 text-lg">{ticket.passenger?.age} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Gender</p>
                    <p className="font-bold text-gray-800 text-lg">{ticket.passenger?.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Phone</p>
                    <p className="font-bold text-gray-800 text-lg">{ticket.passenger?.phone}</p>
                  </div>
                  {ticket.passenger?.email && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-600 font-semibold">Email</p>
                      <p className="font-semibold text-gray-800">{ticket.passenger?.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
              <p className="text-sm font-semibold text-gray-600">SCAN FOR TICKET DETAILS</p>
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={JSON.stringify(ticket)} size={128} bgColor="#fff" fgColor="#1e293b" />
              </div>
            </div>

            {/* Booking Date */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex gap-3">
              <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 font-semibold">Booked On</p>
                <p className="font-semibold text-gray-800">{new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.print()}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="h-5 w-5" />
            <span>Download Ticket</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/my-tickets")}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Back to All Tickets
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default TicketPreviewPage;
