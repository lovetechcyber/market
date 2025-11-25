import AdminEscrowAnalytics from "./AdminEscrowAnalytics";
import AdminEscrowsTable from "./AdminEscrowsTable";
import AdminWithdrawals from "./AdminWithdrawals";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import AdminCategories from "./AdminCategories";
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
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-64">
        <AdminNavbar />

        <div className="p-6 space-y-10">
          {/* Page Title */}
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">
            Admin Dashboard
          </h1>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              { title: "Total Users", value: "1,240" },
              { title: "Total Sales", value: "850" },
              { title: "Revenue", value: "₦54,000" },
              { title: "Disputes", value: "3" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition duration-200"
              >
                <h3 className="text-gray-500 text-sm">{stat.title}</h3>
                <p className="text-3xl font-semibold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Sales & Revenue
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Analytics + Withdrawals + Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AdminEscrowAnalytics />
            </div>

            <div className="space-y-6">
              <AdminWithdrawals />
              <AdminCategories />
            </div>
          </div>

          {/* Tables & Other Modules */}
          <AdminEscrowsTable />

          {/* Additional Admin Pages */}
          <Users />
          <Product />
          <Order />
          <Report />
          <Support />
          <Setting />
          <CommissionSettings />
        </div>
      </div>
    </div>
  );
}
