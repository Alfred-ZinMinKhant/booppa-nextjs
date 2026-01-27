"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.booppa.io";

export default function TrackTicketPage({ params }: { params: { ticketId: string } }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!token) {
        setError("Missing tracking token.");
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/tickets/track/${params.ticketId}?token=${token}`);
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(json?.detail || "Ticket not found");
        }
        setData(json);
      } catch (err: any) {
        setError(err?.message || "Unable to load ticket");
      }
    };
    fetchTicket();
  }, [params.ticketId, token]);

  return (
    <main className="min-h-screen bg-black py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Track your ticket</h1>

        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {!error && !data && (
          <p className="text-gray-400">Loading ticket...</p>
        )}

        {data && (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 space-y-4">
            <div>
              <div className="text-sm text-gray-400">Ticket ID</div>
              <div className="text-white font-semibold">{data.ticket.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Subject</div>
              <div className="text-white">{data.ticket.subject}</div>
            </div>
            <div className="flex gap-6">
              <div>
                <div className="text-sm text-gray-400">Status</div>
                <div className="text-white">{data.ticket.status}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Priority</div>
                <div className="text-white">{data.ticket.priority}</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-2">Replies</div>
              {data.replies.length === 0 ? (
                <div className="text-gray-400">No replies yet.</div>
              ) : (
                <div className="space-y-3">
                  {data.replies.map((reply: any, idx: number) => (
                    <div key={idx} className="rounded-md border border-gray-800 bg-gray-950 p-3">
                      <div className="text-xs text-gray-500">{reply.author}</div>
                      <div className="text-white">{reply.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
