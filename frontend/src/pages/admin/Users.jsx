/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import AdminSidebar from "./AdminNavbar";
import AdminNavbar from "./AdminSidebar";
import { Search, MapPin, UserX, UserCheck } from "lucide-react";
import { toast } from "react-toastify";

// Dummy data (replace with API later)
const mockUsers = [
  {
    _id: "1",
    username: "John Doe",
    email: "john@example.com",
    location: "Lagos, Nigeria",
    status: "active",
    joinedAt: "2025-05-10",
  },
  {
    _id: "2",
    username: "Mary Ann",
    email: "mary@example.com",
    location: "Abuja, Nigeria",
    status: "suspended",
    joinedAt: "2025-06-22",
  },
  {
    _id: "3",
    username: "Kingsley Bright",
    email: "king@example.com",
    location: "Port Harcourt, Nigeria",
    status: "active",
    joinedAt: "2025-04-01",
  },
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const handleToggleSuspendf = async (id) => {
  const user = users.find(u => u._id === id);
  const newStatus = user.status === "active" ? "suspended" : "active";
  await axios.put(`/api/admin/users/suspend/${id}`, { status: newStatus });
  toast.success(`${user.username} ${newStatus === "suspended" ? "suspended" : "unsuspended"} successfully.`);
  };


  useEffect(() => {
    // Replace with real API call later
    setUsers(mockUsers);
  }, []);

  // Filter users by username & location
  const filteredUsers = users.filter((user) => {
    return (
      user.username.toLowerCase().includes(searchUsername.toLowerCase()) &&
      user.location.toLowerCase().includes(searchLocation.toLowerCase())
    );
  });

  // Toggle user suspension
  const handleToggleSuspend = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u._id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u
      )
    );

    const user = users.find((u) => u._id === id);
    toast.success(
      user.status === "active"
        ? `${user.username} has been suspended.`
        : `${user.username} has been unsuspended.`
    );
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="ml-64 w-full min-h-screen bg-gray-100">
        <AdminNavbar />
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Manage Users</h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center bg-white shadow-sm px-4 py-2 rounded-lg w-64">
              <Search className="text-gray-500 mr-2" size={18} />
              <input
                type="text"
                placeholder="Filter by username..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className="outline-none w-full text-sm"
              />
            </div>
            <div className="flex items-center bg-white shadow-sm px-4 py-2 rounded-lg w-64">
              <MapPin className="text-gray-500 mr-2" size={18} />
              <input
                type="text"
                placeholder="Filter by location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-t hover:bg-gray-50 transition-all"
                    >
                      <td className="px-6 py-3 font-medium">{user.username}</td>
                      <td className="px-6 py-3">{user.email}</td>
                      <td className="px-6 py-3">{user.location}</td>
                      <td className="px-6 py-3">{user.joinedAt}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.status === "active"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => handleToggleSuspend(user._id)}
                          className={`flex items-center justify-center gap-1 px-3 py-1 rounded-md text-white ${
                            user.status === "active"
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-green-500 hover:bg-green-600"
                          } transition`}
                        >
                          {user.status === "active" ? (
                            <>
                              <UserX size={16} /> Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck size={16} /> Unsuspend
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center text-gray-500 py-6 italic"
                    >
                      No users found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
