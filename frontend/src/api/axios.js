import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // allow sending cookies (refresh token)
});

export default api;
