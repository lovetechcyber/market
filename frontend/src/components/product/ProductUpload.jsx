/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { api } from "../../api/axios";

export default function ProductUpload({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("new");
  const [contact, setContact] = useState("");

  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);

  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [city, setCity] = useState("");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const MAX_IMAGES = 5;
  const MAX_VIDEO_MB = 50;

  // Fetch categories from backend
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch states dynamically from Render API
  useEffect(() => {
    async function fetchStates() {
      try {
        const res = await fetch("https://nga-states-lga.onrender.com/fetch");
        const data = await res.json();

        const stateNames = Array.isArray(data)
          ? data.map((item) => (typeof item === "object" ? item.state : item))
          : [];

        setStates(stateNames);
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    }
    fetchStates();
  }, []);

  // Fetch LGAs dynamically based on selected state
  useEffect(() => {
    async function fetchLgas() {
      if (!selectedState) {
        setLgas([]);
        setSelectedLga("");
        return;
      }

      try {
        const res = await fetch(
          `https://nga-states-lga.onrender.com/?state=${encodeURIComponent(
            selectedState
          )}`
        );
        const data = await res.json();

        let extractedLgas = [];
        if (Array.isArray(data)) extractedLgas = data;
        else if (data[selectedState]) extractedLgas = data[selectedState];
        else if (Array.isArray(data.lgas)) extractedLgas = data.lgas;

        setLgas(extractedLgas || []);
        setSelectedLga("");
      } catch (err) {
        console.error("Error fetching LGAs:", err);
        setLgas([]);
      }
    }
    fetchLgas();
  }, [selectedState]);

  // Handle images
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > MAX_IMAGES) {
      setError(`Max ${MAX_IMAGES} images allowed`);
      return;
    }
    setError("");
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (idx) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  // Handle video
  const handleVideo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setError(`Video must be under ${MAX_VIDEO_MB}MB`);
      return;
    }
    setVideo(file);
    setError("");
  };

  // Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !price || !category || !contact || !selectedState || !selectedLga || !city) {
      setError("All fields including location and contact are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("category", category);
      form.append("price", price);
      form.append("condition", condition);
      form.append("contact", contact);
      form.append("state", selectedState);
      form.append("lga", selectedLga);
      form.append("city", city);

      images.forEach((file) => form.append("images", file));
      if (video) form.append("video", video);

      const token = localStorage.getItem("token");

      const resp = await api.post("/products", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      onCreated && onCreated(resp.data.product);

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setPrice("");
      setCondition("new");
      setContact("");
      setSelectedState("");
      setSelectedLga("");
      setCity("");
      setImages([]);
      setVideo(null);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="max-w-2xl mx-auto p-6 mt-20 bg-white rounded-xl shadow-md dark:bg-gray-900 dark:text-gray-100"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-semibold mb-4 text-center">📦 Post a Product</h2>

      {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
      {success && (
        <div className="bg-green-600 text-white text-center p-2 rounded mb-3">
          ✅ Product posted successfully!
        </div>
      )}

      <div className="grid gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Product Title"
          className="p-2 border rounded dark:bg-gray-800"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product Description"
          className="p-2 border rounded dark:bg-gray-800"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded dark:bg-gray-800"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          type="number"
          className="p-2 border rounded dark:bg-gray-800"
        />

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="p-2 border rounded dark:bg-gray-800"
        >
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {selectedState && (
          <select
            value={selectedLga}
            onChange={(e) => setSelectedLga(e.target.value)}
            className="p-2 border rounded dark:bg-gray-800"
          >
            <option value="">Select LGA</option>
            {lgas.map((lg) => (
              <option key={lg} value={lg}>
                {lg}
              </option>
            ))}
          </select>
        )}

        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter City"
          className="p-2 border rounded dark:bg-gray-800"
        />

        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="p-2 border rounded dark:bg-gray-800"
        >
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="refurbished">Refurbished</option>
        </select>

        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Contact (Phone Number)"
          className="p-2 border rounded dark:bg-gray-800"
        />

        <label className="block">
          <div>Images (max {MAX_IMAGES})</div>
          <input type="file" multiple accept="image/*" onChange={handleImages} />
        </label>

        {images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((f, idx) => (
              <div key={idx} className="relative">
                <img
                  src={URL.createObjectURL(f)}
                  className="h-24 w-24 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="block">
          <div>Video (optional)</div>
          <input type="file" accept="video/*" onChange={handleVideo} />
        </label>
        {video && <div className="text-sm">🎥 {video.name}</div>}

        <button
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Post Product"}
        </button>
      </div>
    </form>
  );
}
