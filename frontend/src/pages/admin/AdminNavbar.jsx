const AdminNavbar = () => {
  return (
    <div className="bg-white shadow flex justify-between items-center px-6 py-3 sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-gray-700">Marketplace Admin Dashboard</h1>
      <div className="flex items-center gap-4">
        <img
          src="/admin-avatar.png"
          alt="Admin"
          className="w-10 h-10 rounded-full border"
        />
      </div>
    </div>
  );
};

export default AdminNavbar;
