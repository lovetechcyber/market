import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminReports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/reports");
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (reportId, action) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/reports/resolve/${reportId}`, { action });
      alert(`Payment ${action} successfully`);
      fetchReports();
    } catch (err) {
      alert("Action failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Reports Management</h2>

      {reports.length === 0 ? (
        <p>No reports yet.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="border rounded-lg p-4 shadow bg-white"
            >
              <div className="flex justify-between">
                <div>
                  <p>
                    <strong>Product ID:</strong> {report.productId}
                  </p>
                  <p>
                    <strong>Seller:</strong> {report.sellerUsername}
                  </p>
                  <p>
                    <strong>Description:</strong> {report.description}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`${
                        report.status === "resolved"
                          ? "text-green-600"
                          : report.status === "declined"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {report.status}
                    </span>
                  </p>
                  <p>
                    <strong>Payment Related:</strong>{" "}
                    {report.isPaymentRelated ? "Yes" : "No"}
                  </p>
                </div>

                {report.media?.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {report.media.map((file, i) => (
                      <a
                        key={i}
                        href={file}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-blue-600"
                      >
                        View Proof {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {report.isPaymentRelated && report.status === "pending" && (
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handleAction(report._id, "release")}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Release Payment
                  </button>
                  <button
                    onClick={() => handleAction(report._id, "decline")}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Decline Payment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
