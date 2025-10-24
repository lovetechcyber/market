// src/pages/ClientDashboard.jsx
import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tag,
  Heart,
  History,
  Wallet,
  Settings,
  User,
  Flag,
  Menu,
} from "lucide-react";
import { PaymentContext } from "../components/contex/PaymentContex"; // adjust path if needed

export default function Dashboard() {
  const [active, setActive] = useState("overview");
  const [searchParams] = useSearchParams();
  const [reportPrefill, setReportPrefill] = useState(null);

  useEffect(() => {
    const isReport = searchParams.get("report");
    const productId = searchParams.get("productId");
    const seller = searchParams.get("seller");
    if (isReport) {
      setActive("report");
      setReportPrefill({ productId: productId || "", sellerUsername: seller || "" });
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 pt-20">
      <Sidebar active={active} setActive={setActive} />
      <main className="flex-1 ml-64 p-6">
        {active === "overview" && <Overview />}
        {active === "myItems" && <MyItems />}
        {active === "orders" && <Orders />}
        {active === "favorites" && <Favorites />}
        {active === "history" && <HistoryPage />}
        {active === "balance" && <Balance />}
        {active === "report" && <ReportForm prefill={reportPrefill} />}
        {active === "settings" && <SettingsPage />}
        {active === "profile" && <Profile />}
      </main>
    </div>
  );
}

/* ---------------- Sidebar ---------------- */
const menu = [
  { id: "overview", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "myItems", label: "My Items", icon: <Package size={18} /> },
  { id: "orders", label: "My Orders", icon: <Tag size={18} /> },
  { id: "favorites", label: "Favorites", icon: <Heart size={18} /> },
  { id: "history", label: "History", icon: <History size={18} /> },
  { id: "balance", label: "Balance", icon: <Wallet size={18} /> },
  { id: "report", label: "Report", icon: <Flag size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  { id: "profile", label: "Profile", icon: <User size={18} /> },
];

function Sidebar({ active, setActive }) {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r fixed h-full flex flex-col">
      <div className="p-6 text-2xl font-bold text-indigo-600 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span>User Dashboard</span>
          <Menu className="hidden md:block" />
        </div>
      </div>

      <nav className="flex-1 mt-4 space-y-1 px-2">
        {menu.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            className={`flex items-center w-full px-4 py-3 rounded-md text-left transition ${
              active === m.id
                ? "bg-indigo-100 dark:bg-indigo-600 text-indigo-700 dark:text-white font-semibold"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span className="mr-3 text-gray-600 dark:text-gray-300">{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 text-xs text-gray-500 border-t dark:border-gray-700">
        © {new Date().getFullYear()} Marketplace
      </div>
    </aside>
  );
}

/* ---------------- Overview ---------------- */
function Overview() {
  const [stats, setStats] = useState({ posted: 0, sold: 0, balance: 0 });
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("/api/user/dashboard"); // optional endpoint that returns summary
        if (!mounted) return;
        if (res.data) setStats({
          posted: res.data.itemsPosted ?? 0,
          sold: res.data.sold ?? 0,
          balance: res.data.balance ?? 0,
        });
      } catch (err) {
        // fallback / ignore
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome back 👋</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Items Posted" value={stats.posted} />
        <StatCard title="Sold" value={stats.sold} />
        <StatCard title="Balance" value={`₦${Number(stats.balance).toLocaleString()}`} />
      </div>
    </div>
  );
}

/* ---------------- MyItems ---------------- */
function MyItems() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", price: "", category: "" });
  const mountedRef = useRef(true);

  const fetch = async () => {
    try {
      const res = await axios.get("/api/products/my-items", { withCredentials: true });
      // backend returns { products: [...] } earlier; account for both shapes:
      setItems(res.data.products ?? res.data ?? []);
    } catch (err) {
      console.error("Failed to fetch my items", err);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => (mountedRef.current = false);
  }, []);

  const startEdit = (p) => {
    setEditing(p._id);
    setForm({ title: p.title, price: p.price, category: p.category || "" });
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`/api/products/${id}`, form, { withCredentials: true });
      setEditing(null);
      fetch();
      toast("Product updated");
    } catch (err) {
      console.error(err);
      toast("Update failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/api/products/${id}`, { withCredentials: true });
      fetch();
      toast("Product deleted");
    } catch (err) {
      console.error(err);
      toast("Delete failed");
    }
  };

  const toggle = async (id, current) => {
    const newStatus = current === "sold" ? "available" : "sold";
    try {
      await axios.put(`/api/products/${id}`, { status: newStatus }, { withCredentials: true });
      fetch();
      toast(`Marked ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast("Status update failed");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Items</h2>

      {items.length === 0 ? (
        <p className="text-gray-600">No items uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((p) => (
            <div key={p._id} className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg overflow-hidden">
              <div className="relative h-48 bg-gray-100">
                {p.images?.[0]?.url ? (
                  <img src={p.images[0].url} alt={p.title} className="object-cover w-full h-full" />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">No image</div>
                )}
                <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded ${p.status === "sold" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
                  {p.status ?? "available"}
                </span>
              </div>

              <div className="p-4">
                {editing === p._id ? (
                  <>
                    <input className="w-full border rounded p-2 mb-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    <input className="w-full border rounded p-2 mb-2" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                    <input className="w-full border rounded p-2 mb-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />

                    <div className="flex gap-2">
                      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => saveEdit(p._id)}>Save</button>
                      <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-lg truncate">{p.title}</h3>
                    <p className="text-gray-600 mt-1">₦{p.price}</p>
                    <p className="text-xs text-gray-500 mt-1">{p.category ?? "Uncategorized"}</p>

                    <div className="flex justify-between mt-4 text-sm items-center">
                      <div className="flex gap-3">
                        <button onClick={() => startEdit(p)} className="text-indigo-600 hover:underline">Edit</button>
                        <button onClick={() => toggle(p._id, p.status)} className="text-yellow-600">{p.status === "sold" ? "Mark Available" : "Mark Sold"}</button>
                      </div>

                      <button onClick={() => remove(p._id)} className="text-red-500 hover:underline">Delete</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Orders ---------------- */
function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(null); // id of order we are expanding
  const { releasePayment } = useContext(PaymentContext);
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const pollingRef = useRef(null);

  const steps = ["processing", "shipped", "in_transit", "delivered"];

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/orders/user-orders", { withCredentials: true });
      const data = res.data ?? [];
      if (mountedRef.current) setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchOrders();
    pollingRef.current = setInterval(fetchOrders, 10000);
    return () => {
      mountedRef.current = false;
      clearInterval(pollingRef.current);
    };
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status }, { withCredentials: true });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o)));
      toast(`Order marked ${status}`);
    } catch (err) {
      console.error(err);
      toast("Failed to update order");
    }
  };

  const confirmDelivery = async (orderId, productId) => {
    const ok = window.confirm("Confirm you've received your product? This will release escrow to the seller.");
    if (!ok) return;
    try {
      await releasePayment(orderId); // PaymentContext expected to handle API and authorization
      // mark product sold on backend too (api provided earlier)
      if (productId) {
        await axios.patch(`/api/products/${productId}/tag-sold`, {}, { withCredentials: true });
      }
      toast("Payment released to seller!");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast("Failed to release payment");
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Orders & Sales</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const meId = o.userId; // backend earlier used userId; adjust if different
            const isBuyer = o.buyer?._id === meId || o.buyerId === meId;
            const isSeller = o.seller?._id === meId || o.sellerId === meId;
            const currentIndex = Math.max(0, steps.indexOf(o.orderStatus || "processing"));
            const tag = o.status === "released" ? "Sold" : "Available";

            return (
              <div key={o._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <h3 className="font-semibold">{o.productName}</h3>
                    <p className="text-sm text-gray-600">₦{Number(o.amount).toLocaleString()}</p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${tag === "Sold" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{tag}</span>
                    </div>
                    <p className="text-sm mt-2">
                      Status: <span className="font-medium">{(o.status || o.orderStatus || "").replace("_", " ")}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{isBuyer ? `Seller: ${o.seller?.username || "N/A"}` : `Buyer: ${o.buyer?.username || "N/A"}`}</p>
                  </div>

                  <div className="flex gap-2 items-center">
                    {isSeller && o.status !== "released" && (
                      <>
                        <button onClick={() => updateOrderStatus(o._id, "processing")} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Processing</button>
                        <button onClick={() => updateOrderStatus(o._id, "shipped")} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">Shipped</button>
                        <button onClick={() => updateOrderStatus(o._id, "delivered")} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Delivered</button>
                      </>
                    )}

                    {isBuyer && o.status === "delivered" && (
                      <button onClick={() => confirmDelivery(o._id, o.product?._id)} className="bg-indigo-600 text-white px-4 py-2 rounded">Confirm & Release</button>
                    )}

                    <button onClick={() => setTracking((t) => (t === o._1d ? null : o._id))} className="bg-gray-100 px-3 py-1 rounded text-sm">Toggle Track</button>
                    <button onClick={() => navigate(`/track/${o._id}`)} className="bg-gray-100 px-3 py-1 rounded text-sm">Track Order</button>
                  </div>
                </div>

                {/* Inline tracking (expand) */}
                {tracking === o._id && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Tracking</h4>
                    <div className="flex gap-4">
                      {steps.map((s, idx) => (
                        <div key={s} className="flex-1 text-center">
                          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-white font-bold ${idx <= currentIndex ? "bg-green-500" : "bg-gray-300"}`}>{idx + 1}</div>
                          <div className={`mt-2 text-xs ${idx <= currentIndex ? "text-green-600 font-semibold" : "text-gray-500"}`}>{s.replace("_", " ")}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-3">Last update: {new Date(o.updatedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- Report Form ---------------- */
function ReportForm({ prefill }) {
  const [form, setForm] = useState({ productId: "", sellerUsername: "", description: "", isPaymentRelated: false });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefill) {
      setForm((f) => ({ ...f, productId: prefill.productId ?? "", sellerUsername: prefill.sellerUsername ?? "" }));
    }
  }, [prefill]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("productId", form.productId);
      fd.append("sellerUsername", form.sellerUsername);
      fd.append("description", form.description);
      fd.append("isPaymentRelated", form.isPaymentRelated ? "true" : "false");
      for (let i = 0; i < files.length; i++) fd.append("media", files[i]);

      await axios.post("/api/report", fd, { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true });
      toast("Report submitted");
      setForm({ productId: "", sellerUsername: "", description: "", isPaymentRelated: false });
      setFiles([]);
    } catch (err) {
      console.error(err);
      toast("Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold mb-4">Report Product / Seller</h2>
      <form onSubmit={submit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-3">
        <input required placeholder="Product ID" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="w-full border p-2 rounded" />
        <input required placeholder="Seller Username" value={form.sellerUsername} onChange={(e) => setForm({ ...form, sellerUsername: e.target.value })} className="w-full border p-2 rounded" />
        <textarea required placeholder="Describe the issue" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border p-2 rounded" rows={4} />
        <input type="file" multiple accept="image/*,video/*" onChange={(e) => setFiles(Array.from(e.target.files))} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isPaymentRelated} onChange={(e) => setForm({ ...form, isPaymentRelated: e.target.checked })} />
          <span>Payment-related</span>
        </label>
        <div className="flex gap-2">
          <button disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">{loading ? "Submitting..." : "Submit Report"}</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Small pages ---------------- */
function Favorites() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Favorites ❤️</h2>
      <p>Your liked items show here.</p>
    </div>
  );
}

function HistoryPage() {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    axios.get("/api/user/history", { withCredentials: true }).then((r) => setHistory(r.data ?? []));
  }, []);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">History</h2>
      {history.length === 0 ? <p>No history yet.</p> : (
        <ul className="space-y-3">
          {history.map((h, i) => <li key={i} className="bg-white dark:bg-gray-800 p-4 rounded shadow"><div className="font-semibold">{h.itemName}</div><div className="text-sm text-gray-500">{h.date} — {h.action}</div></li>)}
        </ul>
      )}
    </div>
  );
}

function Balance() {
  const [balance, setBalance] = useState(null);
  useEffect(() => {
    axios.get("/api/user/balance", { withCredentials: true }).then((r) => setBalance(r.data ?? null)).catch(()=>{});
  }, []);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Wallet Balance</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <p className="text-sm text-gray-500">Escrow & available balance</p>
        <p className="text-2xl font-semibold mt-2">{balance ? `₦${Number(balance.total).toLocaleString()}` : "Loading..."}</p>
      </div>
    </div>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useState({ email: "", notifications: true });
  useEffect(() => {
    axios.get("/api/user/settings", { withCredentials: true }).then((r) => setSettings(r.data ?? settings)).catch(()=>{});
  }, []);
  const save = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/api/user/settings", settings, { withCredentials: true });
      toast("Settings saved");
    } catch (err) {
      toast("Save failed");
    }
  };
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <form onSubmit={save} className="space-y-3 max-w-md bg-white dark:bg-gray-800 p-6 rounded shadow">
        <input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="w-full border p-2 rounded" />
        <label className="flex items-center gap-2"><input type="checkbox" checked={settings.notifications} onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })} /> Enable notifications</label>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded">Save Changes</button>
      </form>
    </div>
  );
}

function Profile() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    axios.get("/api/user/profile", { withCredentials: true }).then((r) => setUser(r.data)).catch(()=>{});
  }, []);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      {user ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
          <p><strong>Full Name:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone || "—"}</p>
          <p><strong>Location:</strong> {user.location || "—"}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}

/* ---------------- Helpers ---------------- */
function StatCard({ title, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-indigo-600 mt-2">{value}</div>
    </div>
  );
}

// Minimal toast (replace with your toast lib if available)
function toast(msg) {
  // small floating notification
  const el = document.createElement("div");
  el.innerText = msg;
  el.className = "fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded shadow";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
