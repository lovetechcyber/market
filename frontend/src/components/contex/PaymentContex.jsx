import React, { createContext } from "react";
import axios from "axios";

export const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  const initiatePayment = async (productId, amount) => {
    return axios.post(`${API_URL}/payments/initiate`, { productId, amount });
  };

  const verifyPayment = async (reference) => {
    return axios.get(`${API_URL}/payments/verify/${reference}`);
  };

  const releasePayment = async (orderId) => {
    return axios.post(`${API_URL}/payments/release`, { orderId });
  };

  return (
    <PaymentContext.Provider value={{ initiatePayment, verifyPayment, releasePayment }}>
      {children}
    </PaymentContext.Provider>
  );
};
