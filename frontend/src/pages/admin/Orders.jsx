import React, { useState, useEffect } from "react";
import axios from "axios";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/orders");
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${id}`, { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.buyer?.username.toLowerCase().includes(filter.toLowerCase()) ||
      order.seller?.username.toLowerCase().includes(filter.toLowerCase());
    const matchStatus = statusFilter ? order.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-gray-700">Order Management</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by buyer/seller username..."
          className="border rounded-lg px-4 py-2 w-full md:w-1/3 focus:ring-2 focus:ring-indigo-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <select
          className="border rounded-lg px-4 py-2 w-full md:w-1/5 focus:ring-2 focus:ring-indigo-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_escrow">In Escrow</option>
          <option value="released">Released</option>
          <option value="declined">Declined</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">Buyer</th>
              <th className="p-3 text-left">Seller</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-6">
                  Loading orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{order._id.slice(-6)}</td>
                  <td className="p-3">{order.buyer?.username || "—"}</td>
                  <td className="p-3">{order.seller?.username || "—"}</td>
                  <td className="p-3 font-medium">₦{order.amount.toLocaleString()}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        order.status === "released"
                          ? "bg-green-100 text-green-700"
                          : order.status === "in_escrow"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "declined"
                          ? "bg-red-100 text-red-700"
                          : order.status === "refunded"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusChange(order._id, "released")}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Release
                    </button>
                    <button
                      onClick={() => handleStatusChange(order._id, "refunded")}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Refund
                    </button>
                    <button
                      onClick={() => handleStatusChange(order._id, "declined")}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Decline
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Order;
