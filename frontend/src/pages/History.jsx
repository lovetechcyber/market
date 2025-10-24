import { useEffect, useState } from "react";
import axios from "axios";

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios
      .get("/api/users/history", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setHistory(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Browsing History</h1>
      <div className="grid grid-cols-2 gap-4">
        {history.map((p) => (
          <div key={p._id} className="border p-3 rounded">
            <img src={p.images[0]} alt={p.title} className="w-full h-32 object-cover" />
            <h2 className="mt-2 font-semibold">{p.title}</h2>
            <p>${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;
