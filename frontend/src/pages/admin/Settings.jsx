import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

const Setting = () => {
  const [commission, setCommission] = useState("");
  const [email, setEmail] = useState("");
  const [platformName, setPlatformName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  // ✅ Fetch current settings
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setCommission(data?.commission || "");
      setEmail(data?.supportEmail || "");
      setPlatformName(data?.platformName || "");
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  // ✅ Save updated settings
  const handleSave = async () => {
    if (!commission || !email || !platformName) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commission,
          supportEmail: email,
          platformName,
        }),
      });

      if (res.ok) {
        toast.success("Settings updated successfully");
        fetchSettings();
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      toast.error("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Platform Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Commission Settings */}
        <Card className="shadow-md hover:shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-2">Commission Setup</h2>
            <Label>Commission Percentage (%)</Label>
            <Input
              type="number"
              placeholder="e.g. 5"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              This percentage will be deducted automatically from each escrow
              release.
            </p>
          </CardContent>
        </Card>

        {/* Platform Info */}
        <Card className="shadow-md hover:shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-2">Platform Details</h2>

            <Label>Platform Name</Label>
            <Input
              type="text"
              placeholder="Marketplace Online"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
            />

            <Label>Support Email</Label>
            <Input
              type="email"
              placeholder="support@yourplatform.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default Setting;
