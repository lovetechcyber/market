import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const res = await axios.get("/api/admin/wallet-withdrawals", { headers: { Authorization: `Bearer ${token}` } });
      setWithdrawals(res.data.withdrawals || []);
    } catch (err) {
      console.error(err);
    }
  };

  const process = async (id) => {
    try {
      await axios.post(`/api/wallet/process/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("Processing started");
      fetchWithdrawals();
    } catch (err) {
      console.error(err);
      alert("Failed to process");
    }
  };

  const verify = async (id) => {
    try {
      await axios.get(`/api/wallet/verify/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      alert("Verified");
      fetchWithdrawals();
    } catch (err) {
      console.error(err);
      alert("Verify failed");
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-3">Withdrawals</h3>
      <div>
        {withdrawals.length === 0 && <div className="text-sm text-gray-500">No withdrawal requests</div>}
        <ul className="space-y-3">
          {withdrawals.map(w => (
            <li key={w._id} className="border p-3 rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{w.seller?.email || w.seller}</div>
                <div className="text-sm text-gray-500">₦{w.amount?.toLocaleString()}</div>
                <div className="text-xs text-gray-400">{w.status}</div>
              </div>
              <div className="space-x-2">
                {w.status === "pending" && <button onClick={() => process(w._id)} className="bg-blue-600 text-white px-3 py-1 rounded">Process</button>}
                {w.status === "processing" && <button onClick={() => verify(w._id)} className="bg-green-600 text-white px-3 py-1 rounded">Verify</button>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
