import { useState } from "react";
import api from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import PasswordStrength from "../components/passwordStrength";

export default function ResetPassword() {
  const { token } = useParams();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/auth/reset-password/${token}`, form);
      setMsg("✅ Password reset successful!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Reset failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <input type="password" name="password" placeholder="New Password" onChange={handleChange} className="w-full mb-3 p-2 border rounded" />
        <PasswordStrength password={form.password} />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} className="w-full mb-3 p-2 border rounded" />
        <button className="w-full bg-blue-500 text-white py-2 rounded">Reset</button>
        {msg && <p className="mt-3 text-center text-sm">{msg}</p>}
      </form>
    </div>
  );
}
