// frontend/src/components/RecentlyViewed.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function RecentlyViewed() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const key = 'recent_views';
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    setItems(arr);
  }, []);

  if (!items.length) return null;

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Recently viewed</h3>
      <div className="flex gap-3 overflow-x-auto">
        {items.map(it => (
          <Link key={it._id} to={`/product/${it._id}`} className="w-40 block">
            <div className="h-28 bg-gray-100 rounded overflow-hidden">
              {it.image ? <img src={it.image} alt={it.title} className="w-full h-full object-cover" /> : <div className="p-4 text-gray-400">No image</div>}
            </div>
            <div className="text-sm mt-1">{it.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
