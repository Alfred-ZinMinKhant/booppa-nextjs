"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "";
      const body = new URLSearchParams({ username: email, password });
      const res = await fetch(`${base}/api/v1/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Login failed");
      }
      const data = await res.json();
      // Store token in localStorage (or cookie if preferred)
      localStorage.setItem("admin_token", data.access_token);
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="w-full max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col items-start justify-center text-left px-6">
          <div className="mb-6">
            <h1 className="text-4xl font-extrabold text-white">Booppa Admin</h1>
            <p className="text-gray-300 mt-2">Manage users, reports and subscription access.</p>
          </div>
          <div className="bg-white/5 p-6 rounded-lg border border-white/5">
            <h3 className="text-white font-semibold mb-2">Quick Actions</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• View audit reports</li>
              <li>• Manage subscriptions</li>
              <li>• Support & user management</li>
            </ul>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-auto"
          aria-label="Admin login form"
        >
          <div className="flex items-center justify-center mb-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect width="24" height="24" rx="6" fill="#0ea5a4" />
              <path d="M7 12h10M7 16h6M7 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2 text-center">Admin Login</h2>
          <p className="text-sm text-center text-gray-500 mb-6">Sign in to manage the Booppa workspace</p>

          {error && (
            <div className="mb-4 text-red-600 text-center font-medium">{error}</div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block mb-1 font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between mb-6 text-sm">
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-teal-500" />
              <span className="ml-2 text-gray-600">Remember me</span>
            </label>
            <a href="/admin/forgot" className="text-teal-600 hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded font-semibold hover:bg-teal-700 transition disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">By signing in you agree to the admin Terms of Service.</p>
        </form>
      </div>
    </div>
  );
}
