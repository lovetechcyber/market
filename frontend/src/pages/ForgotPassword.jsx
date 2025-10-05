import React, { useState } from "react";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/forgot-password", { email });
      setMsg("📧 Reset link sent to your email");
    } catch (err) {
      setMsg(err.response?.data?.msg || "Error sending reset link");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-3 p-2 border rounded" />
        <button className="w-full bg-purple-500 text-white py-2 rounded">Send Reset Link</button>
        {msg && <p className="mt-3 text-center text-sm">{msg}</p>}
      </form>
    </div>
  );
}
