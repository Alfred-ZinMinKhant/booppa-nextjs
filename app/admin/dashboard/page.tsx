"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) {
      router.replace("/admin/login");
    } else {
      setToken(t);
      setLoading(false);
    }
  }, [router]);

  // Token refresh logic (example: every 10 minutes)
  useEffect(() => {
    const interval = setInterval(async () => {
      const refreshToken = localStorage.getItem("admin_refresh_token");
      if (!refreshToken) return;
      setRefreshing(true);
      setError("");
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "";
        const res = await fetch(`${base}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        const data = await res.json();
        if (res.ok && data.access_token) {
          localStorage.setItem("admin_token", data.access_token);
          if (data.refresh_token) {
            localStorage.setItem("admin_refresh_token", data.refresh_token);
          }
        } else {
          setError(data.detail || "Token refresh failed");
        }
      } catch (err: any) {
        setError(err.message || "Token refresh failed");
      } finally {
        setRefreshing(false);
      }
    }, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
    router.replace("/admin/login");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-4 text-center">Admin Dashboard</h1>
        <p className="mb-4 text-center">Welcome, admin! You are logged in.</p>
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
            className="text-blue-600 hover:underline"
          >
            Logout
          </button>
        </div>
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        {refreshing && <div className="mb-4 text-gray-500 text-center">Refreshing token...</div>}
        {/* Add dashboard features here */}
      </div>
    </div>
  );
}
