import { Routes, Route, Router } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChatRoom from "./pages/ChatRoom";
import ProductDetail from "./components/product/ProductDetails";
import ProductUpload from "./components/product/ProductUpload";
import ProductListing from "./components/product/ProductListing";
import RecentlyViewed from "./components/product/RecentView";
import ProductSearch from "./components/product/ProductSearch";
import CartButton from "./components/CartButton";
import WishlistButton from "./components/WishlistButton";

import Home from "./pages/Home";
import Category from "./pages/Category";
import Shop from "./pages/Shop";
import Support from "./pages/Support";
import Footer from "./components/Footer";
import Navbar from "./pages/Navbar";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import TrackOrder from "./pages/TrackOrder";

function App() {
  return (
   
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/chat-room" element={<ChatRoom />} />
            <Route path="/product-details" element={<ProductDetail />} />
            <Route path="/product-upload" element={<ProductUpload />} />
            <Route path="/product-listing" element={<ProductListing />} />
            <Route path="/recently-viewed" element={<RecentlyViewed />} />
            <Route path="/product-search" element={<ProductSearch />} />
            <Route path="/cart-button" element={<CartButton />} />
            <Route path="/wishlist-button" element={<WishlistButton />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/categories" element={<Category />} />
            <Route path="/support" element={<Support />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/track/:orderId" element={<TrackOrder />} />

          </Routes>
        </div>
        <Footer />
      </div>
    
  );
}

export default App;
