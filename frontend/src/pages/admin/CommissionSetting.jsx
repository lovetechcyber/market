import React, { useState, useEffect } from "react";
import axios from "axios";

const CommissionSettings = () => {
  const [settings, setSettings] = useState({ global: 5, categoryRates: {} });
  const [newRate, setNewRate] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await axios.get("http://localhost:5000/api/admin/commission");
      setSettings(res.data);
    };
    fetchSettings();
  }, []);

  const updateGlobalRate = async () => {
    await axios.post("http://localhost:5000/api/admin/commission/global", {
      rate: settings.global,
    });
    alert("Global commission updated!");
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Commission Settings</h2>
      <label className="block mb-2">Global Commission (%)</label>
      <input
        type="number"
        value={settings.global}
        onChange={(e) => setSettings({ ...settings, global: e.target.value })}
        className="border p-2 rounded-lg w-24"
      />
      <button
        onClick={updateGlobalRate}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg ml-3 hover:bg-blue-700"
      >
        Save
      </button>
    </div>
  );
};

export default CommissionSettings;
