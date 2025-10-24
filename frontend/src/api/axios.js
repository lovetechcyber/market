import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // allow sending cookies (refresh token)
});




// helper to attach token
export function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export default api;
