import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminEscrowsTable() {
  const [escrows, setEscrows] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchEscrows();
    fetchReports();
  }, []);

  const fetchEscrows = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/escrows", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEscrows(res.data.escrows);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get("/api/admin/reports/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Update escrow status manually (admin)
  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `/api/admin/escrow/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEscrows();
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  // 🔹 Resolve report (release or decline payment)
  const handleReportAction = async (reportId, action) => {
    try {
      await axios.put(
        `/api/admin/reports/resolve/${reportId}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Payment ${action} successfully`);
      fetchReports();
      fetchEscrows();
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  // Helper: find report linked to this escrow
  const getLinkedReport = (productId) =>
    reports.find((r) => r.productId === productId);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-20">
      <h3 className="text-xl font-semibold mb-5">Escrow & Payment Reports</h3>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full">
            <thead className="text-left text-sm text-gray-600 border-b">
              <tr>
                <th className="py-2">Product</th>
                <th>Buyer</th>
                <th>Seller</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Report</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {escrows.map((e) => {
                const report = getLinkedReport(e.product?._id || e.product);
                return (
                  <tr
                    key={e._id}
                    className="border-b hover:bg-gray-50 transition-all"
                  >
                    <td className="py-2 font-medium">
                      {e.product?.name || e.product}
                    </td>
                    <td>{e.buyer?.email || e.buyer}</td>
                    <td>{e.seller?.email || e.seller}</td>
                    <td>₦{e.amount?.toLocaleString()}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          e.status === "released"
                            ? "bg-green-100 text-green-700"
                            : e.status === "declined"
                            ? "bg-red-100 text-red-700"
                            : e.status === "in_escrow"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>

                    {/* Payment report info */}
                    <td>
                      {report ? (
                        <div>
                          <p className="text-xs text-gray-600">
                            <strong>Reason:</strong> {report.description}
                          </p>
                          {report.media?.length > 0 && (
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {report.media.map((file, i) => (
                                <a
                                  key={i}
                                  href={file}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-indigo-600 underline text-xs"
                                >
                                  View Proof {i + 1}
                                </a>
                              ))}
                            </div>
                          )}
                          <p className="text-xs mt-1">
                            <span
                              className={`${
                                report.status === "resolved"
                                  ? "text-green-600"
                                  : report.status === "declined"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                              } font-semibold`}
                            >
                              {report.status}
                            </span>
                          </p>
                          {report.status === "pending" && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() =>
                                  handleReportAction(report._id, "release")
                                }
                                className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700"
                              >
                                Release
                              </button>
                              <button
                                onClick={() =>
                                  handleReportAction(report._id, "decline")
                                }
                                className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No report</span>
                      )}
                    </td>

                    <td className="text-xs text-gray-500">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>

                    <td className="text-right space-x-2">
                      <button
                        onClick={() => updateStatus(e._id, "approved")}
                        className="bg-green-600 text-white text-xs px-3 py-1 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(e._id, "declined")}
                        className="bg-red-600 text-white text-xs px-3 py-1 rounded"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => updateStatus(e._id, "released")}
                        className="bg-blue-600 text-white text-xs px-3 py-1 rounded"
                      >
                        Release
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
