
import React, { useEffect, useState } from "react";
import { bookingAPI } from "../utils/api";

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await bookingAPI.getMy();
        setTickets(data);
      } catch (err) {
        setError("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Tickets</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && tickets.length === 0 && (
        <p>No tickets found.</p>
      )}
      {!loading && !error && tickets.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">PNR</th>
                <th className="px-4 py-2">Train</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Class</th>
                <th className="px-4 py-2">Seat</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket._id} className="border-t">
                  <td className="px-4 py-2 font-mono">{ticket.pnr}</td>
                  <td className="px-4 py-2">{ticket.trainName} (#{ticket.trainNumber})</td>
                  <td className="px-4 py-2">{ticket.date}</td>
                  <td className="px-4 py-2">{ticket.class}</td>
                  <td className="px-4 py-2 font-semibold">{ticket.seat}</td>
                  <td className="px-4 py-2">{ticket.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
