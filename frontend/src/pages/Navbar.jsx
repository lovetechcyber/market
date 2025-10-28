import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  MessageSquare,
  LogOut,
} from "lucide-react";
import {api, setAccessToken} from "../utils/axiosInstance";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load user info from localStorage
useEffect(() => {
  const loadUser = () => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  };

  loadUser(); // initial load

  // Listen for localStorage changes (e.g., from login/signup/logout)
  window.addEventListener("storage", loadUser);

  return () => {
    window.removeEventListener("storage", loadUser);
  };
}, []);


  // Handle logout
const handleLogout = async () => {
  try {
    // Optional: Tell backend to clear refresh token cookie
    await api.post("/auth/logout");

    // Remove local session data
    localStorage.removeItem("userInfo");
    localStorage.removeItem("accessToken");
    setAccessToken(null); // also clear token in memory
    delete api.defaults.headers.common["Authorization"];

    // Clear user state
    setUser(null);

    // Redirect to login
    navigate("/login");
  } catch (error) {
    console.error("Logout error:", error);
    // Even if the backend fails, still clear client state
    localStorage.removeItem("userInfo");
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login");
  }
};

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Market<span className="text-gray-800">Place</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-blue-600 transition">Home</Link>
          <Link to="/shop" className="hover:text-blue-600 transition">Shop</Link>
          <Link to="/product-upload" className="hover:text-blue-600 transition">Post Ads</Link>
          <Link to="/categories" className="hover:text-blue-600 transition">Categories</Link>
          <Link to="/support" className="hover:text-blue-600 transition">Support</Link>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center">
          <input
            type="text"
            placeholder="Search products..."
            className="border rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* Icons / User Section */}
        <div className="flex items-center space-x-4 relative">
          <ShoppingCart
            className="cursor-pointer hover:text-blue-600 transition"
            onClick={() => navigate("/cart")}
          />
          <MessageSquare
            className="cursor-pointer hover:text-blue-600 transition"
            onClick={() => navigate("/messages")}
          />

          {/* Conditional Buttons */}
          {!user ? (
            <div className="hidden md:flex space-x-3">
              <Link
                to="/login"
                className="px-4 py-1 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex space-x-3 items-center">
              <Link
                to="/dashboard"
                className="px-4 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-1 border border-red-600 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition"
              >
                <LogOut className="cursor-pointer hover:text-blue-600 transition" />
                Logout
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white shadow-md px-4 py-3 space-y-2">
          <Link to="/" className="block hover:text-blue-600">Home</Link>
          <Link to="/shop" className="block hover:text-blue-600">Shop</Link>
<Link to="/product-upload" className="hover:text-blue-600 transition">Post Ads</Link>
          <Link to="/categories" className="block hover:text-blue-600">Categories</Link>
          <Link to="/support" className="block hover:text-blue-600">Support</Link>

          {!user ? (
            <>
              <Link to="/login" className="block text-blue-600 font-medium">
                Login
              </Link>
              <Link to="/signup" className="block text-blue-600 font-medium">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="block text-blue-600 font-medium">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="block text-red-500 font-medium w-full text-left"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
