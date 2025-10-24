import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  MessageSquare,
  User,
  LogOut,
  Settings,
  Package,
  LayoutDashboard,
} from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user info in localStorage (assuming user info is stored after login)
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/login");
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

        {/* Icons / User */}
        <div className="flex items-center space-x-4 relative">
          <ShoppingCart
            className="cursor-pointer hover:text-blue-600 transition"
            onClick={() => navigate("/cart")}
          />
          <MessageSquare
            className="cursor-pointer hover:text-blue-600 transition"
            onClick={() => navigate("/messages")}
          />

          {/* Conditional User Section */}
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
            <div className="relative">
              <button
                className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <User />
                <span className="font-medium">{user.name?.split(" ")[0]}</span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg w-44">
                  <Link
                    to="/account"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <LayoutDashboard size={16} /> Overview
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <Package size={16} /> My Orders
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <Settings size={16} /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Toggle */}
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
              <Link to="/account" className="block text-blue-600 font-medium">
                Account
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
