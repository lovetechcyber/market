import { NavLink } from "react-router-dom";
import { BarChart3, Users, Package, ShoppingBag, AlertTriangle, MessageSquare, Settings } from "lucide-react";

const AdminSidebar = () => {
  const links = [
    { name: "Dashboard", icon: <BarChart3 />, path: "/admin" },
    { name: "Users", icon: <Users />, path: "/admin/users" },
    { name: "Products", icon: <Package />, path: "/admin/products" },
    { name: "Orders", icon: <ShoppingBag />, path: "/admin/orders" },
    { name: "Reports", icon: <AlertTriangle />, path: "/admin/reports" },
    { name: "Support", icon: <MessageSquare />, path: "/admin/support" },
    { name: "Settings", icon: <Settings />, path: "/admin/settings" },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 h-screen fixed left-0 top-0 flex flex-col">
      <h2 className="text-2xl font-bold text-center py-4 border-b border-gray-700">Admin Panel</h2>
      <nav className="flex-1 overflow-y-auto">
        {links.map((link, i) => (
          <NavLink
            key={i}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition-all ${
                isActive ? "bg-gray-800 border-l-4 border-blue-500" : ""
              }`
            }
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
