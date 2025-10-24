import { useState } from "react";
import { Send, Upload } from "lucide-react";

const Support = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
    file: null,
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending data to backend
    console.log("Report Submitted:", formData);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setFormData({
        name: "",
        email: "",
        category: "",
        message: "",
        file: null,
      });
    }, 3000);
  };

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-2">
          Support Center
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Have a problem, report, or question? We’re here to help!
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Support Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Category</option>
              <option value="account">Account Issue</option>
              <option value="payment">Payment / Escrow Issue</option>
              <option value="report">Report User or Product</option>
              <option value="bug">Bug / Technical Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              required
              placeholder="Describe your issue in detail..."
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Attach File (optional)
            </label>
            <div className="flex items-center space-x-3 border rounded-lg p-2 bg-gray-50">
              <Upload className="text-gray-500" />
              <input
                type="file"
                name="file"
                accept="image/*,.pdf"
                onChange={handleChange}
                className="text-sm text-gray-600"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center"
          >
            <Send className="mr-2 h-5 w-5" /> Submit Report
          </button>

          {/* Success Message */}
          {success && (
            <div className="mt-4 text-green-600 text-center font-medium">
              ✅ Report submitted successfully! Our team will get back to you soon.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Support;
