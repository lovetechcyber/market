import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { toast } from "react-hot-toast";

const Report = () => {
  const [reports, setReports] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch all reports
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  // ✅ Handle report status (reviewed/unreviewed or resolved)
  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Report marked as ${status}`);
        fetchReports();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // ✅ Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesType =
      filterType === "all" ? true : report.type === filterType;
    const matchesSearch =
      report.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Reports & Violations</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by username or product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />

        <Select value={filterType} onValueChange={(val) => setFilterType(val)}>
          <SelectItem value="all">All Reports</SelectItem>
          <SelectItem value="user">User Reports</SelectItem>
          <SelectItem value="product">Product Reports</SelectItem>
        </Select>
      </div>

      {/* Reports List */}
      <div className="grid gap-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report._id} className="shadow-md hover:shadow-lg">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold capitalize">
                      {report.type} Report
                    </h2>
                    <p className="text-sm text-gray-600">
                      Reported By: {report.username}
                    </p>
                    {report.productName && (
                      <p className="text-sm text-gray-600">
                        Product: {report.productName}
                      </p>
                    )}
                    <p className="text-sm mt-2">{report.reason}</p>
                    <p
                      className={`text-xs mt-2 font-semibold ${
                        report.status === "resolved"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      Status: {report.status}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {report.status !== "resolved" && (
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange(report._id, "resolved")}
                      >
                        Mark Resolved
                      </Button>
                    )}
                    {report.status !== "reviewed" && (
                      <Button
                        variant="secondary"
                        onClick={() => handleStatusChange(report._id, "reviewed")}
                      >
                        Mark Reviewed
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">No reports found.</p>
        )}
      </div>
    </div>
  );
};

export default Report;

