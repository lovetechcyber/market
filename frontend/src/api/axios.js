import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // FIXED URL
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ===================== TOKEN HANDLING =====================
export const getAccessToken = () => localStorage.getItem("accessToken");
export const setAccessToken = (token) => localStorage.setItem("accessToken", token);
export const removeAccessToken = () => localStorage.removeItem("accessToken");

// ===================== AUTH HEADER =====================
export const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ===================== REQUEST INTERCEPTOR =====================
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===================== RESPONSE INTERCEPTOR =====================
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Refresh token logic
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("🔁 Attempting token refresh...");

        // Call refresh token endpoint
        const { data } = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        console.log("✅ New Access Token:", newToken);

        // Store new token
        setAccessToken(newToken);

        // Attach new token to requests
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        // Retry original request
        return api(originalRequest);

      } catch (err) {
        console.error("❌ Refresh token failed:", err.message);
        removeAccessToken();
        window.location.href = "/login"; // logout
      }
    }

    return Promise.reject(error);
  }
);

export { api };
