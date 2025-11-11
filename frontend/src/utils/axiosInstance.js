import axios from "axios";

const api = axios.create({
  baseURL: "https://market-e50k.onrender.com/api",
  withCredentials: true, // enable cookies for refresh token
    headers: { "Content-Type": "application/json" }
});

// ======= TOKEN HANDLING =======
export const getAccessToken = () => localStorage.getItem("accessToken");
export const setAccessToken = (token) => localStorage.setItem("accessToken", token);
export const removeAccessToken = () => localStorage.removeItem("accessToken");

// ======= AUTH HEADER =======
export const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ======= REQUEST INTERCEPTOR =======
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ======= RESPONSE INTERCEPTOR =======
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expired → try refreshing
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("🔁 Attempting token refresh...");

        // ⚠️ Use a *new axios instance* for refresh (no auth header)
        const { data } = await api.post(
          "/auth/refresh",
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        console.log("✅ Token refreshed successfully:", newToken);

        setAccessToken(newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        return api(originalRequest); // retry the failed request
      } catch (refreshError) {
        console.error("🚫 Token refresh failed:", refreshError.message);
        removeAccessToken();
        window.location.href = "/login"; // force re-login
      }
    }

    return Promise.reject(error);
  }
);

export { api }; // ✅ named export, not default
