import { useState } from "react";

const ReportForm = () => {
  const [form, setForm] = useState({ category: "", message: "", email: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    alert("Report submitted successfully!");
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-center">Report an Issue</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          className="w-full border rounded-md p-2"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Select Category</option>
          <option value="product">Report Product</option>
          <option value="user">Report User</option>
          <option value="other">Other</option>
        </select>
        <textarea
          className="w-full border rounded-md p-2 h-32"
          placeholder="Describe the issue..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        <input
          type="email"
          className="w-full border rounded-md p-2"
          placeholder="Your Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
