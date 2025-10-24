import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [buyer, setBuyer] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [paymentProvider, setPaymentProvider] = useState("paystack");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.productId.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    window.location.href = `/payment/success?reference=${response.reference}`;
    if (!buyer.email || !buyer.fullName) {
      alert("Please fill in your name and email.");
      return;
    }

    try {
      const items = cart.map((item) => ({
        productId: item.productId._id,
        title: item.productId.title,
        price: item.productId.price,
        quantity: item.quantity,
      }));

      const sellerId = cart[0]?.productId?.seller?._id;
      if (!sellerId) return alert("Seller info missing.");

      const { data } = await axios.post(
        "/api/orders/create",
        {
          sellerId,
          items,
          shipping: 0,
          paymentProvider,
          buyerDetails: buyer,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        alert("Order created but no payment URL returned.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to place order.");
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6 mt-20">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>

      {/* Cart Summary */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.productId._id}
                className="flex justify-between border-b pb-2"
              >
                <span>
                  {item.productId.title} (x{item.quantity})
                </span>
                <span>₦{item.productId.price * item.quantity}</span>
              </div>
            ))}
            <div className="font-bold text-right mt-3">
              Total: ₦{total.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Buyer Info */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h3 className="font-semibold text-lg mb-3">Buyer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={buyer.fullName}
            onChange={(e) => setBuyer({ ...buyer, fullName: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={buyer.email}
            onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={buyer.phone}
            onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Delivery Address"
            value={buyer.address}
            onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
            className="border p-2 rounded"
          />
        </div>
      </div>

      {/* Payment Provider */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h3 className="font-semibold text-lg mb-3">Payment Method</h3>
        <select
          value={paymentProvider}
          onChange={(e) => setPaymentProvider(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="paystack">Paystack (Escrow)</option>
          <option value="flutterwave">Flutterwave (Escrow)</option>
        </select>
      </div>

      <button
        onClick={handlePlaceOrder}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded"
      >
        Place Order & Pay
      </button>
    </div>
  );
}
