
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
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

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
  const minDate = useMemo(() => (dateList.length ? dateList[0] : ''), [dateList]);
  const maxDate = useMemo(
    () => (dateList.length ? dateList[dateList.length - 1] : ''),
    [dateList]
  );

  const availableSet = useMemo(() => new Set(dateList), [dateList]);

  const formatDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getCalendarDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const days: Array<{ date: Date; currentMonth: boolean }> = [];

    for (let i = startWeekday; i > 0; i -= 1) {
      const d = new Date(year, monthIndex, 1 - i);
      days.push({ date: d, currentMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push({ date: new Date(year, monthIndex, day), currentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i += 1) {
      const d = new Date(year, monthIndex + 1, i);
      days.push({ date: d, currentMonth: false });
    }
    return days;
  };

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
      <div className="w-full max-w-5xl mx-auto p-6 md:p-8 bg-gray-900 rounded-2xl shadow-xl border border-gray-800">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-200">
            Available in Thailand time
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-4">Book a Live Demo</h1>
          <p className="text-gray-400 mt-2">
            Pick a date and time that suits you. We’ll confirm by email.
          </p>
        </div>

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
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8">
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Select a date</h2>
              {loading ? (
                <p className="text-gray-400">Loading slots...</p>
              ) : (
                <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      className="text-sm text-gray-300 hover:text-white"
                      onClick={() =>
                        setCalendarMonth(
                          new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                        )
                      }
                    >
                      ← Prev
                    </button>
                    <div className="text-white font-semibold">
                      {calendarMonth.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                    <button
                      type="button"
                      className="text-sm text-gray-300 hover:text-white"
                      onClick={() =>
                        setCalendarMonth(
                          new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                        )
                      }
                    >
                      Next →
                    </button>
                  </div>
                  <div className="grid grid-cols-7 text-xs text-gray-400 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="text-center py-1">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays(calendarMonth).map(({ date, currentMonth }, idx) => {
                      const key = formatDateKey(date);
                      const inRange = (!minDate || key >= minDate) && (!maxDate || key <= maxDate);
                      const available = availableSet.has(key);
                      const isSelected = selectedDate === key;
                      const disabled = !currentMonth || !inRange || !available;

                      return (
                        <button
                          key={`${key}-${idx}`}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            setSelectedSlot(null);
                            if (!available) {
                              setError('No slots are available for that date.');
                              return;
                            }
                            setError(null);
                            setSelectedDate(key);
                          }}
                          className={`h-10 rounded-md text-sm transition ${
                            disabled
                              ? 'text-gray-600'
                              : isSelected
                              ? 'bg-booppa-green/20 text-white border border-booppa-green'
                              : 'text-gray-200 hover:border hover:border-gray-500'
                          }`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                  {minDate && maxDate && (
                    <p className="mt-3 text-xs text-gray-500">
                      Available from {minDate} to {maxDate}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Select a time</h2>
              {!selectedDate ? (
                <div className="rounded-lg border border-dashed border-gray-700 p-6 text-gray-400">
                  Choose a date to see available times.
                </div>
              ) : (
                <div>
                  <div className="mb-4 text-sm text-gray-400">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  {timeSlots.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-700 p-6 text-gray-400">
                      No available time slots for this date.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-full border px-4 py-2 text-sm transition ${
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
