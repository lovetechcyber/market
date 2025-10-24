// components/WishlistButton.js
import axios from "axios";
import { useState } from "react";

export default function WishlistButton({ productId }) {
  const [inWishlist, setInWishlist] = useState(false);

  const toggleWishlist = async () => {
    if (inWishlist) {
      await axios.delete(`/api/wishlist/remove/${productId}`);
      setInWishlist(false);
    } else {
      await axios.post(`/api/wishlist/add/${productId}`);
      setInWishlist(true);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      className={`px-3 py-1 rounded ${inWishlist ? "bg-red-500 text-white" : "bg-gray-200"}`}
    >
      {inWishlist ? "♥ In Wishlist" : "♡ Add to Wishlist"}
    </button>
  );
}
