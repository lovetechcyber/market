import React, { useEffect, useState } from "react";
import axios from "axios";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axios.put(`/api/admin/products/${id}`, { action });
      setProducts((prev) =>
        prev.map((product) =>
          product._id === id
            ? {
                ...product,
                status:
                  action === "suspend"
                    ? "suspended"
                    : action === "unsuspend"
                    ? "active"
                    : product.status,
              }
            : product
        )
      );
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`/api/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchSearch =
      product.name.toLowerCase().includes(filter.toLowerCase()) ||
      product.seller?.username?.toLowerCase().includes(filter.toLowerCase());
    const matchCategory = categoryFilter
      ? product.category === categoryFilter
      : true;
    const matchStatus = statusFilter ? product.status === statusFilter : true;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-gray-700">
        Product Management
      </h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by product or seller username..."
          className="border rounded-lg px-4 py-2 w-full md:w-1/3 focus:ring-2 focus:ring-indigo-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <div className="flex gap-3 flex-wrap">
          <select
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="tech">Tech</option>
            <option value="fashion">Fashion</option>
            <option value="trade">Trade</option>
            <option value="service">Service</option>
          </select>

          <select
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Product ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Seller</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6">
                  Loading products...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{product._id.slice(-6)}</td>
                  <td className="p-3 font-medium text-gray-800">
                    {product.name}
                  </td>
                  <td className="p-3 capitalize">{product.category}</td>
                  <td className="p-3">{product.seller?.username || "—"}</td>
                  <td className="p-3 font-medium">₦{product.price}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        product.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex flex-wrap gap-2">
                    {product.status === "active" ? (
                      <button
                        onClick={() => handleAction(product._id, "suspend")}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(product._id, "unsuspend")}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Unsuspend
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Product;
