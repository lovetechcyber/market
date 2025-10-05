import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return navigate("/login");

    api.get("/user/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUser(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {user ? (
        <>
          <h1 className="text-3xl font-bold">Welcome, {user.name} 👋</h1>
          <button
            onClick={() => {
              localStorage.removeItem("accessToken");
              navigate("/login");
            }}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
