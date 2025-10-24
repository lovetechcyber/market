import { useState, useEffect } from "react";
import api, { authHeader } from "../../api/axios";

export default function ProductUpload({ token, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("new");
  const [contact, setContact] = useState("");
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MAX_IMAGES = 5;
  const MAX_VIDEO_MB = 50;

  const categories = [
    "Electronics",
    "Fashion",
    "Home & Kitchen",
    "Beauty & Health",
    "Sports",
    "Automobile",
    "Real Estate",
    "Agriculture",
    "Services",
    "Other",
  ];

  // Example location data — can be fetched from backend or JSON
  const nigeriaData = {
    Lagos: {
      Ikeja: ["Allen", "Opebi", "Ojodu"],
      Surulere: ["Aguda", "Bode Thomas", "Iponri"],
    },
    Abuja: {
      Garki: ["Area 1", "Area 2", "Area 3"],
      Wuse: ["Zone 1", "Zone 2", "Zone 3"],
    },
    Rivers: {
      "Port Harcourt": ["GRA", "D-Line", "Trans-Amadi"],
      ObioAkpor: ["Rumuokoro", "Rumuodara", "Rumuola"],
    },
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > MAX_IMAGES) {
      setError(`Max ${MAX_IMAGES} images allowed`);
      return;
    }
    setError("");
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleVideo = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > MAX_VIDEO_MB * 1024 * 1024) {
      setError(`Video must be under ${MAX_VIDEO_MB}MB`);
      return;
    }
    setVideo(f);
    setError("");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !price || !category || !contact || !state || !lga || !city) {
      setError("All fields including location and contact are required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("category", category);
      form.append("price", price);
      form.append("condition", condition);
      form.append("contact", contact);
      form.append("state", state);
      form.append("lga", lga);
      form.append("city", city);

      images.forEach((file) => form.append("images", file));
      if (video) form.append("video", video);

      const resp = await api.post("/products", form, {
        headers: {
          ...authHeader(token).headers,
          "Content-Type": "multipart/form-data",
        },
      });

      setLoading(false);
      onCreated && onCreated(resp.data.product);

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setContact("");
      setImages([]);
      setVideo(null);
      setPrice("");
      setCondition("new");
      setState("");
      setLga("");
      setCity("");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Upload failed");
      setLoading(false);
    }
  }

  return (
    <form
      className="max-w-2xl mx-auto p-6 mt-20 bg-white rounded-xl shadow-md dark:bg-gray-900 dark:text-gray-100"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-semibold mb-4 text-center">📦 Post a Product</h2>
      {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}

      <div className="grid gap-3">
        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Product Title"
          className="p-2 border rounded focus:ring-2 focus:ring-blue-400 dark:bg-gray-800"
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product Description"
          className="p-2 border rounded focus:ring-2 focus:ring-blue-400 dark:bg-gray-800"
        />

        {/* Category & Price */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded flex-1 focus:ring-2 focus:ring-blue-400 dark:bg-gray-800"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            type="number"
            className="p-2 border rounded w-40 focus:ring-2 focus:ring-blue-400 dark:bg-gray-800"
          />
        </div>

        {/* Location Selection */}
        <div className="flex flex-col gap-2">
          <select
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setLga("");
              setCity("");
            }}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-400 dark:bg-gray-800"
          >
            <option value="">Select State</option>
            {Object.keys(nigeriaData).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {state && (
            <select
              value={lga}
              onChange={(e) => {
                setLga(e.target.value);
                setCity("");
              }}
              className="p-2 border rounded focus:ring-2 focus:ring-blue-400 dark:bg-gray-800"
            >
              <option value="">Select LGA</option>
              {Object.keys(nigeriaData[state] || {}).map((lg) => (
                <option key={lg} value={lg}>
                  {lg}
                </option>
              ))}
            </select>
          )}

          {lga && (
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="p-2 border rounded focus:ring-2 focus:ring-blue-400 dark:bg-gray-800"
            >
              <option value="">Select City</option>
              {(nigeriaData[state]?.[lga] || []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Condition */}
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-400 dark:bg-gray-800"
        >
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="refurbished">Refurbished</option>
        </select>

        {/* Contact */}
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Seller Contact (e.g. Mobile Number)"
          className="p-2 border rounded focus:ring-2 focus:ring-blue-400 dark:bg-gray-800"
        />

        {/* Images */}
        <label className="block">
          <div className="mb-1">Images (max {MAX_IMAGES})</div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            className="text-sm"
          />
        </label>

        {images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-2">
            {images.map((f, idx) => (
              <div key={idx} className="relative">
                <img
                  src={URL.createObjectURL(f)}
                  alt=""
                  className="h-24 w-24 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Video */}
        <label className="block">
          <div className="mb-1">Video (optional)</div>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideo}
            className="text-sm"
          />
        </label>
        {video && <div className="text-sm">🎥 {video.name}</div>}

        {/* Submit */}
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
