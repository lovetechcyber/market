import { useEffect, useState } from "react";
import { api } from "../../api/axios";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const [deleteId, setDeleteId] = useState(null);

  // Load categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create category
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await api.post("/categories", {
        name: newName,
        icon: newIcon,
      });

      setNewName("");
      setNewIcon("");
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating category");
    }
  };

  // Open edit modal
  const openEditModal = (cat) => {
    setEditMode(true);
    setEditId(cat._id);
    setEditName(cat.name);
    setEditIcon(cat.icon);
  };

  // Save edit
  const handleEdit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/categories/${editId}`, {
        name: editName,
        icon: editIcon,
      });

      setEditMode(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating category");
    }
  };

  // Delete category
  const handleDelete = async () => {
    try {
      await api.delete(`/categories/${deleteId}`);
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      alert("Error deleting category");
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>

      {/* Create New Category */}
      <form onSubmit={handleCreate} className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Category Name"
          className="p-2 border rounded w-1/3"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Icon URL (optional)"
          className="p-2 border rounded w-1/3"
          value={newIcon}
          onChange={(e) => setNewIcon(e.target.value)}
        />

        <button className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">
          Create
        </button>
      </form>

      {/* Category Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Icon</th>
            <th className="p-3 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id} className="text-center">
              <td className="p-3 border">{cat.name}</td>
              <td className="p-3 border">
                {cat.icon ? (
                  <img
                    src={cat.icon}
                    alt=""
                    className="w-8 h-8 mx-auto rounded"
                  />
                ) : (
                  "—"
                )}
              </td>
              <td className="p-3 border flex items-center justify-center gap-3">
                <button
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => openEditModal(cat)}
                >
                  Edit
                </button>

                <button
                  className="px-3 py-1 bg-red-600 text-white rounded"
                  onClick={() => setDeleteId(cat._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="text-xl font-bold mb-4">Edit Category</h3>
            <form onSubmit={handleEdit}>
              <input
                className="w-full p-2 border rounded mb-3"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <input
                className="w-full p-2 border rounded mb-3"
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value)}
                placeholder="Icon URL (optional)"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-1 border rounded"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>

                <button className="px-4 py-1 bg-blue-600 text-white rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-80">
            <h3 className="text-lg font-bold mb-4">Delete Category?</h3>
            <p className="mb-4">This action cannot be undone.</p>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-1 border rounded"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1 bg-red-600 text-white rounded"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
