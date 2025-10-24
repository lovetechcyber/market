import React, { useState } from "react";
import axios from "axios";

const Report = () => {
  const [formData, setFormData] = useState({
    productId: "",
    sellerUsername: "",
    description: "",
    isPaymentRelated: false,
  });

  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("productId", formData.productId);
      data.append("sellerUsername", formData.sellerUsername);
      data.append("description", formData.description);
      data.append("isPaymentRelated", formData.isPaymentRelated);

      for (let i = 0; i < files.length; i++) {
        data.append("media", files[i]);
      }

      const res = await axios.post(
        "http://localhost:5000/api/report",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Report submitted successfully!");
      console.log(res.data);
      setFormData({
        productId: "",
        sellerUsername: "",
        description: "",
        isPaymentRelated: false,
      });
      setFiles([]);
    } catch (error) {
      console.error(error);
      alert("Failed to submit report.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Report Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Product ID</label>
          <input
            type="text"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Enter product ID"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Seller Username</label>
          <input
            type="text"
            name="sellerUsername"
            value={formData.sellerUsername}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Enter seller username"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Explain your issue..."
            rows="4"
            required
          ></textarea>
        </div>

        <div>
          <label className="block font-medium mb-1">Upload Image/Video</label>
          <input
            type="file"
            name="media"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isPaymentRelated"
            checked={formData.isPaymentRelated}
            onChange={handleChange}
            className="mr-2"
          />
          <label>Is this report payment-related?</label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
};

export default Report;
