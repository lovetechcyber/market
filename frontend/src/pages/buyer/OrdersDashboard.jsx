import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PaymentContext } from "../../components/contex/PaymentContex";

const OrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const { releasePayment } = useContext(PaymentContext);
  const navigate = useNavigate();

  const steps = ["processing", "shipped", "in_transit", "delivered"];

  // Fetch orders (auto-refresh every 10s)
  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/orders/user-orders", {
        withCredentials: true,
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Seller updates order progress
  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status }, { withCredentials: true });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o))
      );
      alert(`Order marked as ${status}`);
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  // Buyer confirms delivery (releases escrow + marks product sold)
  const handleConfirm = async (orderId, productId) => {
    if (window.confirm("Confirm you’ve received your product?")) {
      try {
        await releasePayment(orderId);
        await axios.patch(`/api/products/${productId}/tag-sold`, {}, { withCredentials: true });
        alert("✅ Payment released and product marked as SOLD!");
        fetchOrders();
      } catch (err) {
        console.error("Payment release failed:", err);
      }
    }
  };

  const handleTrackOrder = (orderId) => navigate(`/track/${orderId}`);

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Orders & Sales</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const userId = order.userId;
            const isBuyer = order.buyer?._id === userId;
            const isSeller = order.seller?._id === userId;
            const currentStepIndex = steps.indexOf(order.orderStatus);
            const productTag = order.status === "released" ? "Sold" : "Available";

            return (
              <div
                key={order._id}
                className="border rounded-lg p-4 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex justify-between items-start flex-wrap gap-3">
                  {/* Left Section */}
                  <div>
                    <h3 className="font-semibold text-lg">{order.productName}</h3>
                    <p className="text-sm text-gray-600">
                      ₦{order.amount.toLocaleString()}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-1 rounded-md text-xs font-semibold ${
                        productTag === "Sold"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {productTag}
                    </span>

                    <p
                      className={`text-sm mt-2 font-medium ${
                        order.status === "released"
                          ? "text-green-600"
                          : order.status === "in_escrow"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    >
                      Status: {order.status.replace("_", " ")}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {isBuyer
                        ? `Seller: ${order.seller?.username || "N/A"}`
                        : `Buyer: ${order.buyer?.username || "N/A"}`}
                    </p>
                  </div>

                  {/* Right Section (Actions) */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {isSeller && order.status !== "released" && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => updateOrderStatus(order._id, "processing")}
                          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm"
                        >
                          Mark Processing
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order._id, "shipped")}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 text-sm"
                        >
                          Mark Shipped
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order._id, "delivered")}
                          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                        >
                          Mark Delivered
                        </button>
                      </div>
                    )}

                    {isBuyer && order.status === "delivered" && (
                      <button
                        onClick={() => handleConfirm(order._id, order.product?._id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                      >
                        Confirm & Release Payment
                      </button>
                    )}

                    <button
                      onClick={() => handleTrackOrder(order._id)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                    >
                      Track Order
                    </button>
                  </div>
                </div>

                {/* Tracking Progress */}
                {trackingOrder === order._id && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold mb-3 text-gray-700">
                      Order Tracking Progress
                    </h4>
                    <div className="flex justify-between relative">
                      {steps.map((step, index) => (
                        <div key={step} className="flex-1 text-center relative">
                          <div
                            className={`w-8 h-8 mx-auto rounded-full ${
                              index <= currentStepIndex
                                ? "bg-green-500"
                                : "bg-gray-300"
                            } flex items-center justify-center text-white font-bold`}
                          >
                            {index + 1}
                          </div>
                          <p
                            className={`mt-2 text-sm capitalize ${
                              index <= currentStepIndex
                                ? "text-green-600 font-semibold"
                                : "text-gray-500"
                            }`}
                          >
                            {step.replace("_", " ")}
                          </p>
                          {index < steps.length - 1 && (
                            <div
                              className={`absolute top-4 left-[50%] w-full h-1 ${
                                index < currentStepIndex
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Last updated: {new Date(order.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersDashboard;
