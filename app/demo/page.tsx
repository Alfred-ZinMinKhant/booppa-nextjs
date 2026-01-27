
"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.booppa.io';

type Slot = {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  remaining: number;
  available: boolean;
};

export default function DemoPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: string; token: string } | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/booking/slots?days=30`);
        if (!res.ok) throw new Error('Failed to load slots');
        const data = (await res.json()) as Slot[];
        setSlots(data.filter((s) => s.available));
      } catch (err) {
        setError('Unable to load slots. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, []);

  const dates = useMemo(() => {
    const grouped: Record<string, Slot[]> = {};
    slots.forEach((s) => {
      grouped[s.slot_date] = grouped[s.slot_date] || [];
      grouped[s.slot_date].push(s);
    });
    return grouped;
  }, [slots]);

  const dateList = useMemo(() => Object.keys(dates).sort(), [dates]);

  const timeSlots = useMemo(() => {
    if (!selectedDate) return [] as Slot[];
    return (dates[selectedDate] || []).sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [dates, selectedDate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedSlot) {
      setError('Please select a time slot.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: selectedSlot.id,
          customer_name: name,
          customer_email: email,
          customer_phone: phone || null,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail || 'Booking failed');
      }
      const data = await res.json();
      setSuccess({ id: data.id, token: data.booking_token });
    } catch (err: any) {
      setError(err?.message || 'Booking failed');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-4xl mx-auto p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-800">
        <h1 className="text-3xl font-bold text-white mb-4 text-center">Book a Live Demo</h1>
        <p className="text-gray-400 text-center mb-8">
          Select a time slot below to schedule a live walkthrough with our team.
        </p>

        {error && (
          <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {success ? (
          <div className="rounded-md border border-green-500/30 bg-green-500/10 p-6 text-green-100">
            <h2 className="text-xl font-semibold mb-2">Booking confirmed</h2>
            <p className="text-sm text-green-200">Booking ID: {success.id}</p>
            <p className="text-sm text-green-200">We’ll contact you to confirm details.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Choose a date</h2>
              {loading ? (
                <p className="text-gray-400">Loading slots...</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {dateList.map((date) => (
                    <button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedSlot(null);
                      }}
                      className={`rounded-lg border px-3 py-2 text-sm transition ${
                        selectedDate === date
                          ? 'border-booppa-green bg-booppa-green/10 text-white'
                          : 'border-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {new Date(date).toLocaleDateString('en-SG', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Choose a time</h2>
              {!selectedDate ? (
                <p className="text-gray-400">Pick a date to see available times.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-lg border px-3 py-2 text-sm transition ${
                        selectedSlot?.id === slot.id
                          ? 'border-booppa-green bg-booppa-green/10 text-white'
                          : 'border-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {slot.start_time} - {slot.end_time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
              <input
                className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white"
                placeholder="Phone (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <input
                className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white"
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-booppa-green px-4 py-3 font-semibold text-white hover:bg-green-500"
            >
              Confirm booking
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
