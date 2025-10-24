import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const steps = ["processing", "shipped", "in_transit", "delivered"];

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/orders/${orderId}`,
        { withCredentials: true }
      );
      setOrder(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching order:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000); // 🔁 Refresh every 10s
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) return <p className="p-6 text-gray-500">Loading order...</p>;
  if (!order) return <p className="p-6 text-red-500">Order not found.</p>;

  const currentStepIndex = steps.indexOf(order.orderStatus);
  const isDelivered = order.orderStatus === "delivered";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Tracking Order — #{order._id.slice(-6).toUpperCase()}
        </h2>
        <button
          onClick={() => navigate("/orders")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
        >
          ← Back to Orders
        </button>
      </div>

      {/* Order Info */}
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
        <h3 className="font-semibold text-lg">{order.productName}</h3>
        <p className="text-gray-600 mt-1">₦{order.amount}</p>
        <p className="text-sm mt-2">
          <strong>Buyer:</strong> {order.buyer?.username || "N/A"} <br />
          <strong>Seller:</strong> {order.seller?.username || "N/A"}
        </p>

        <div className="mt-3">
          <span
            className={`inline-block px-3 py-1 text-sm rounded-md ${
              order.status === "released"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {order.status === "released" ? "Payment Released" : "In Escrow"}
          </span>
        </div>
      </div>

      {/* Tracking Steps */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-semibold mb-4 text-gray-800">
          Order Progress
        </h4>

        <div className="flex justify-between relative mt-4">
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

        {isDelivered && (
          <div className="text-center mt-6">
            <p className="text-green-700 font-semibold">
              ✅ Order Delivered Successfully!
            </p>
            {order.status !== "released" && (
              <p className="text-gray-600 text-sm">
                Awaiting buyer confirmation to release payment.
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-6 text-center">
          Last updated: {new Date(order.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default TrackOrder;
