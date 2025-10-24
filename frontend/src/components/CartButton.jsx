// components/CartButton.js
import axios from "axios";
import { useState } from "react";

export default function CartButton({ productId }) {
  const [inCart, setInCart] = useState(false);

  const addToCart = async () => {
    await axios.post(`/api/cart/add/${productId}`);
    setInCart(true);
  };

  const removeFromCart = async () => {
    await axios.delete(`/api/cart/remove/${productId}`);
    setInCart(false);
  };

  return (
    <button
      onClick={inCart ? removeFromCart : addToCart}
      className={`px-3 py-1 rounded ${inCart ? "bg-green-500 text-white" : "bg-gray-200"}`}
    >
      {inCart ? "✓ In Cart" : "Add to Cart"}
    </button>
  );
}
