"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.booppa.io";

export default function SupportPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ ticketId: string; trackingUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/tickets/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          category,
          subject,
          message,
          honeypot,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.detail || "Unable to submit ticket");
      }

      setSuccess({ ticketId: data.ticket_id, trackingUrl: data.tracking_url });
      setName("");
      setEmail("");
      setCategory("");
      setSubject("");
      setMessage("");
      setHoneypot("");
    } catch (err: any) {
      setError(err?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Contact Support</h1>
          <p className="text-gray-400 mt-2">
            Submit a ticket and we’ll respond within 24 business hours.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 md:p-8">
          {error && (
            <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 p-4 text-green-100">
              <div className="font-semibold">Ticket submitted</div>
              <div className="text-sm text-green-200">Ticket ID: {success.ticketId}</div>
              <a href={success.trackingUrl} className="text-sm text-green-200 underline">
                Track your ticket
              </a>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white"
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select category
                </option>
                <option value="Technical">Technical Support</option>
                <option value="Billing">Billing</option>
                <option value="Partnership">Partnership</option>
                <option value="General">General Inquiry</option>
              </select>
              <input
                className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <textarea
              className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white"
              rows={6}
              placeholder="Describe your issue..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            <input
              className="hidden"
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-booppa-green px-4 py-3 font-semibold text-white hover:bg-green-500 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit ticket"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
