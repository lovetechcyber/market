import React from "react";
import AdminEscrowAnalytics from "./AdminEscrowAnalytics";
import AdminEscrowsTable from "./AdminEscrowsTable";
import AdminWithdrawals from "./AdminWithdrawals";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Users from "./Users";
import Setting from "./Settings";
import CommissionSettings from "./CommissionSetting";
import Support from "./Support";
import Report from "./Report";
import Order from "./Orders";
import Product from "./Products";

const data = [
  { name: "Jan", sales: 4000, revenue: 2400 },
  { name: "Feb", sales: 3000, revenue: 1398 },
  { name: "Mar", sales: 2000, revenue: 9800 },
  { name: "Apr", sales: 2780, revenue: 3908 },
];

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="flex">
        <AdminSidebar />
        <div className="ml-64 w-full min-h-screen bg-gray-100">
          <AdminNavbar />
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Overview</h2>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { title: "Total Users", value: "1,240" },
                { title: "Total Sales", value: "850" },
                { title: "Revenue", value: "₦54,000" },
                { title: "Disputes", value: "3" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 shadow hover:shadow-md transition"
                >
                  <h3 className="text-gray-600 text-sm">{stat.title}</h3>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-lg font-semibold mb-4">Sales & Revenue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#3b82f6" />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AdminEscrowAnalytics />
        </div>
        <div>
          <AdminWithdrawals />
        </div>
      </div>

      <div>
        <AdminEscrowsTable />
      </div>
              <Users />
        <Product />
        <Order />
        <Report />
        <Support />
        <Setting />
        <CommissionSettings />
    </div>
  );
}
