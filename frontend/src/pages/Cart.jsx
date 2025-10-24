import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch cart items
  const fetchCart = async () => {
    try {
      const res = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCart(res.data);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load cart items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Calculate total
  const total = cart.reduce(
    (sum, item) => sum + item.productId.price * item.quantity,
    0
  );

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity < 1) return;
      await axios.put(
        `/api/cart/update/${productId}`,
        { quantity },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchCart();
    } catch (err) {
      console.error(err);
      alert("❌ Could not update quantity.");
    }
  };

  // Remove item
  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`/api/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchCart();
    } catch (err) {
      console.error(err);
      alert("❌ Could not remove item.");
    }
  };

  // Place order
  const handlePlaceOrder = async () => {
    try {
      await axios.post(
        "/api/orders",
        { cart },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("✅ Order placed successfully!");
      setCart([]);
      navigate("/orders");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to place order.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading cart...</div>;

  return (
    <div className="p-6 mt-20">
      <h1 className="text-2xl font-bold mb-6">🛍 Your Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center text-gray-500">Your cart is empty.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cart.map((item) => (
            <div
              key={item.productId._id}
              className="flex items-center justify-between border rounded p-4 bg-white shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.productId.images?.[0]}
                  alt={item.productId.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{item.productId.title}</h3>
                  <p className="text-gray-600">${item.productId.price}</p>
                  <p
                    className={`text-sm font-medium ${
                      item.productId.status === "sold"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {item.productId.status === "sold"
                      ? "Sold Out"
                      : "Available"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(item.productId._id, item.quantity - 1)
                  }
                  className="bg-gray-200 px-3 py-1 rounded"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.productId._id, item.quantity + 1)
                  }
                  className="bg-gray-200 px-3 py-1 rounded"
                >
                  +
                </button>

                <button
                  onClick={() => removeFromCart(item.productId._id)}
                  className="ml-3 bg-red-500 text-white px-3 py-1 rounded"
                >
                  🗑 Remove
                </button>
              </div>
            </div>
          ))}

          {/* Total and Order Button */}
          <div className="mt-6 flex justify-between items-center bg-gray-100 p-4 rounded shadow">
            <h2 className="text-xl font-semibold">Total: ${total.toFixed(2)}</h2>
            <button
              onClick={handlePlaceOrder}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              ✅ Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
