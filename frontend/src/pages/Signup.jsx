import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {api} from "../api/axios";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
    state: "",
    localGovernment: "",
    town: "",
  });

  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch all Nigerian states on mount
useEffect(() => {
  const fetchStates = async () => {
    try {
      const res = await fetch("https://nga-states-lga.onrender.com/fetch");

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      // API returns [{ state: "Abia", lgas: [...] }, ...]
      if (Array.isArray(data)) {
        setStates(data.map((item) => item.state));
      } else if (data?.states) {
        setStates(data.states.map((item) => item.state));
      } else {
        console.error("Unexpected data format:", data);
      }
    } catch (err) {
      console.error("Error fetching states:", err);

      // Fallback in case API is unavailable
      setStates([
        "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
        "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
        "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna",
        "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
        "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
        "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
      ]);
    }
  };

  fetchStates();
}, []);

// Fetch LGAs when state changes
useEffect(() => {
  const fetchLgas = async () => {
    if (!form.state) return;
    try {
      const res = await fetch(
        `https://nga-states-lga.onrender.com/?state=${encodeURIComponent(form.state)}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Fetched LGA data:", data); // For debugging

      if (Array.isArray(data)) {
        // Sometimes the API returns an array directly
        setLgas(data);
      } else if (Array.isArray(data?.lgas)) {
        setLgas(data.lgas);
      } else if (data[form.state]) {
        setLgas(data[form.state]);
      } else {
        console.error("Unexpected LGA format:", data);
        setLgas([]);
      }
    } catch (err) {
      console.error("Error fetching LGAs:", err);
      setLgas([]);
    }
  };

  fetchLgas();
}, [form.state]);

// Handle cascading dropdown logic
const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "state") {
    setForm({ ...form, state: value, localGovernment: "", town: "" });
  } else if (name === "localGovernment") {
    setForm({ ...form, localGovernment: value, town: "" });
  } else {
    setForm({ ...form, [name]: value });
  }
};

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!validatePassword(form.password)) {
    return setError(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long."
    );
  }

  if (form.password !== form.confirmPassword) {
    return setError("Passwords do not match");
  }

  try {
    setLoading(true);
    const { data } = await api.post("/auth/signup", {
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      mobileNumber: form.mobileNumber,
      location: {
        state: form.state,
        localGovernment: form.localGovernment,
        town: form.town,
      },
    });

    // ✅ Automatically log user in after signup
    const loginRes = await api.post("/auth/login", {
      email: form.email,
      password: form.password,
    });

    // ✅ Save token and user info
    localStorage.setItem("accessToken", loginRes.data.accessToken);
    localStorage.setItem("userInfo", JSON.stringify(loginRes.data.user));

    // ✅ Set default header for future API calls
    api.defaults.headers.common["Authorization"] = `Bearer ${loginRes.data.accessToken}`;

    // ✅ Trigger Navbar re-render
    window.dispatchEvent(new Event("storage"));

    alert("Signup successful!");
    navigate("/dashboard");
  } catch (err) {
    setError(err.response?.data?.message || "Signup failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4 mt-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        {error && (
          <p className="text-red-600 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="tel"
            name="mobileNumber"
            placeholder="Mobile Number"
            value={form.mobileNumber}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          {/* Dynamic Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* State */}
            <select
              name="state"
              value={form.state}
              onChange={handleChange}
              required
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            {/* LGA */}
            <select
              name="localGovernment"
              value={form.localGovernment}
              onChange={handleChange}
              required
              disabled={!form.state}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select LGA</option>
              {lgas.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>

            {/* Town / City */}
            <input
              type="text"
              name="town"
              placeholder="Town / City"
              value={form.town}
              onChange={handleChange}
              required
              disabled={!form.localGovernment}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-blue-600"
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <span
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-blue-600"
            >
              {showConfirm ? "🙈" : "👁️"}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
