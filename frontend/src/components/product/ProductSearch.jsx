import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ProductSearch() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [cities, setCities] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    state: "",
    lga: "",
    city: ""
  });

  // Fetch all products with filters
  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams(filters);
      const res = await axios.get(`/api/products?${params.toString()}`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/products/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch states
  const fetchStates = async () => {
    try {
      const res = await axios.get("/api/locations/states");
      setStates(res.data.states || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch LGAs dynamically when state changes
  const fetchLgas = async (state) => {
    try {
      const res = await axios.get(`/api/locations/lgas?state=${state}`);
      setLgas(res.data.lgas || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch cities dynamically when LGA changes
  const fetchCities = async (lga) => {
    try {
      const res = await axios.get(`/api/locations/cities?lga=${lga}`);
      setCities(res.data.cities || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStates();
  }, []);

  // Handle state/LGA/city changes
  useEffect(() => {
    if (filters.state) fetchLgas(filters.state);
  }, [filters.state]);

  useEffect(() => {
    if (filters.lga) fetchCities(filters.lga);
  }, [filters.lga]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen mt-20">
      {/* Search Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border p-2 rounded flex-1 min-w-[200px]"
        />

        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="border p-2 rounded min-w-[150px]"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          className="border p-2 rounded w-28"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          className="border p-2 rounded w-28"
        />

        <select
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value, lga: "", city: "" })}
          className="border p-2 rounded min-w-[150px]"
        >
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filters.lga}
          onChange={(e) => setFilters({ ...filters, lga: e.target.value, city: "" })}
          className="border p-2 rounded min-w-[150px]"
          disabled={!filters.state}
        >
          <option value="">Select LGA</option>
          {lgas.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <select
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="border p-2 rounded min-w-[150px]"
          disabled={!filters.lga}
        >
          <option value="">Select City</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={fetchProducts}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {/* Product Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.length > 0 ? (
          products.map((p) => (
            <div
              key={p._id}
              className="border rounded-lg bg-white shadow-sm hover:shadow-md transition"
            >
              <Link to={`/product/${p._id}`}>
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0].url}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">No Image</div>
                  )}
                </div>
              </Link>
              <div className="p-3">
                <h3 className="font-semibold text-lg truncate">{p.title}</h3>
                <div className="text-sm text-gray-600">₦{p.price}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {p.category || "Uncategorized"} • {p.city || p.location || "Unknown"}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600 py-10">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
}
