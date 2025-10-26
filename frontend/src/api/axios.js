import axios from "axios";

const api = axios.create({
  baseURL: "https://market-e50k.onrender.com/api",
  withCredentials: true, // allow sending cookies (refresh token)
});




// helper to attach token
export function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export default api;
