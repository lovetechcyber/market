import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const PaymentSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("Verifying...");
  const navigate = useNavigate();

  // Fetch latest order status
  const fetchOrderStatus = async () => {
    try {
      const res = await axios.get(`/api/orders/${orderId}`);
      setOrder(res.data);
      setStatus(res.data.status || "Processing");
    } catch (err) {
      console.error(err);
      setStatus("Error fetching order status");
    }
  };

  // Poll every 10 seconds
  useEffect(() => {
    fetchOrderStatus();
    const interval = setInterval(fetchOrderStatus, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-3">
          ✅ Payment Successful
        </h2>

        <p className="text-gray-600 mb-6">
          Your payment has been confirmed. We’re preparing your order.
        </p>

        {order ? (
          <div className="mb-6 text-left text-gray-700">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Amount:</strong> ₦{order.amount}</p>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Product:</strong> {order.product?.name}</p>
            <p><strong>Tracking:</strong> {order.trackingId || "Pending"}</p>
          </div>
        ) : (
          <p>Loading order details...</p>
        )}

        <button
          onClick={() => navigate("/orders")}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Track Order
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
