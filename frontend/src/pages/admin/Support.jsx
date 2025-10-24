import React, { useEffect, useState } from "react";
import axios from "axios";

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/support");
      setTickets(res.data);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) return;
    try {
      const res = await axios.post(`/api/admin/support/${selectedTicket._id}/reply`, {
        message: replyMessage,
      });
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === selectedTicket._id
            ? { ...ticket, messages: [...ticket.messages, res.data] }
            : ticket
        )
      );
      setReplyMessage("");
    } catch (error) {
      console.error("Failed to send reply:", error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/api/admin/support/${id}`, { status: newStatus });
      setTickets((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
      );
    } catch (error) {
      console.error("Failed to update ticket status:", error);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchSearch = ticket.user?.username
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchStatus = statusFilter ? ticket.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-gray-700">
        Support Ticket Management
      </h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by username..."
          className="border rounded-lg px-4 py-2 w-full md:w-1/3 focus:ring-2 focus:ring-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded-lg px-4 py-2 w-full md:w-1/4 focus:ring-2 focus:ring-indigo-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Ticket List */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Ticket ID</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6">
                  Loading tickets...
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No tickets found.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr
                  key={ticket._id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-3">{ticket._id.slice(-6)}</td>
                  <td className="p-3">{ticket.user?.username}</td>
                  <td className="p-3">{ticket.subject}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        ticket.status === "open"
                          ? "bg-blue-100 text-blue-700"
                          : ticket.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      View
                    </button>
                    {ticket.status !== "closed" ? (
                      <button
                        onClick={() =>
                          handleStatusChange(ticket._id, "closed")
                        }
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Close
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleStatusChange(ticket._id, "open")
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Reopen
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Ticket View */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Ticket: {selectedTicket.subject}
            </h2>
            <div className="max-h-80 overflow-y-auto mb-4 border rounded-lg p-3 bg-gray-50">
              {selectedTicket.messages?.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-2 ${
                    msg.sender === "admin" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block px-3 py-2 rounded-lg ${
                      msg.sender === "admin"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <span className="text-xs text-gray-500 block mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a reply..."
                className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
              <button
                onClick={handleReply}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
