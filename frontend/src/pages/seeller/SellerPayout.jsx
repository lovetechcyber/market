import React, { useEffect, useState } from "react";
import axios from "axios";

const SellerPayouts = () => {
  const [payouts, setPayouts] = useState([]);

  useEffect(() => {
    const fetchPayouts = async () => {
      const res = await axios.get("http://localhost:5000/api/payments/seller-payouts");
      setPayouts(res.data);
    };
    fetchPayouts();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Payouts</h2>
      {payouts.map((p) => (
        <div key={p._id} className="border p-4 rounded-lg bg-white mb-2 shadow-sm">
          <h3 className="font-medium">{p.productName}</h3>
          <p className="text-gray-500 text-sm">₦{p.amount}</p>
          <p className="text-green-600 text-sm mt-1">
            Commission Deducted: ₦{p.commission}
          </p>
          <p className="text-gray-700 text-sm mt-1">
            Status: {p.status === "released" ? "Paid" : "Pending"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SellerPayouts;
