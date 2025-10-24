import React, { useState, useEffect } from "react";
import RevenueChart from "../components/RevenueChart";
import EscrowPieChart from "../components/EscrowPieChart";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalRevenue: 0,
    commission: 0,
    disputes: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [escrowData, setEscrowData] = useState([]);

  useEffect(() => {
    // Fetch analytics data from backend API
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data.summary);
        setChartData(data.monthlyRevenue);
        setEscrowData(data.escrowStatus);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Analytics Dashboard</h1>

      {/* Summary KPI Cards */}
      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total Sales</p>
          <h2 className="text-2xl font-bold text-blue-600">
            {analytics.totalSales}
          </h2>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <h2 className="text-2xl font-bold text-green-600">
            ₦{analytics.totalRevenue.toLocaleString()}
          </h2>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Commission Earned</p>
          <h2 className="text-2xl font-bold text-purple-600">
            ₦{analytics.commission.toLocaleString()}
          </h2>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Active Disputes</p>
          <h2 className="text-2xl font-bold text-red-600">
            {analytics.disputes}
          </h2>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
          <RevenueChart data={chartData} />
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Escrow Status Breakdown</h3>
          <EscrowPieChart data={escrowData} />
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
