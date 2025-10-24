import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentContext } from "../../context/PaymentContext";

const EscrowCheckout = ({ product }) => {
  const navigate = useNavigate();
  const { initiatePayment } = useContext(PaymentContext);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await initiatePayment(product._id, product.price);
      if (response?.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl; // redirect to Paystack/Flutterwave
      } else {
        alert("Unable to initiate payment.");
      }
    } catch (error) {
      console.error(error);
      alert("Payment initiation failed.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md border mt-4">
      <h2 className="text-lg font-semibold mb-2">Secure Payment (Escrow)</h2>
      <p className="text-gray-600 mb-4">
        Your payment will be securely held in escrow until you confirm delivery.
      </p>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
};

export default EscrowCheckout;


