import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const COLORS = ["#60A5FA", "#F59E0B", "#34D399", "#EF4444", "#A78BFA"];

export default function AdminEscrowAnalytics() {
  const [summary, setSummary] = useState(null);
  const [byStatus, setByStatus] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("/api/admin/escrow-summary", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setSummary(res.data);
        setByStatus(res.data.byStatus?.map((b) => ({ name: b._id, value: b.totalAmount, count: b.count })) || []);
      }).catch(console.error);
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-3">Escrow Summary</h2>
      {!summary ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                  {byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <div className="mb-4">
              <h3 className="font-medium">Totals</h3>
              <p className="text-sm text-gray-600">Total escrowed: ₦{(summary.totals?.totalEscrow || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total commissions: ₦{(summary.commissions?.totalCommission || 0).toLocaleString()}</p>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byStatus}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
