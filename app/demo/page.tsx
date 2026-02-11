
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
    <main className="bg-white min-h-screen text-[#0f172a] py-24 px-6">
      <div className="container max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-black mb-6">Book a Live Demo</h1>
          <p className="text-xl text-[#64748b] max-w-3xl mx-auto leading-relaxed">
            Pick a date and time that suits you. See BOOPPA's compliance infrastructure in action.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-[#f0fdf4] p-12 lg:p-20 rounded-[3rem] border-2 border-[#10b981] text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-[#10b981] rounded-full flex items-center justify-center text-white text-4xl mb-8 mx-auto shadow-lg shadow-[#10b981]/20">
              ✓
            </div>
            <h2 className="text-3xl lg:text-4xl font-black mb-6 text-[#0f172a]">Booking Confirmed</h2>
            <p className="text-[#64748b] text-lg leading-relaxed mb-10">
              Your demo is booked! Booking ID: <strong className="text-[#0f172a]">{success.id}</strong>. 
              We'll send a calendar invite to your email shortly.
            </p>
            <button 
              onClick={() => setSuccess(null)}
              className="btn btn-outline border-[#0f172a] text-[#0f172a] px-10 py-4 font-bold rounded-2xl hover:bg-[#0f172a] hover:text-white transition-all"
            >
              Book Another Session
            </button>
          </div>
        ) : (
          <div className="bg-white p-8 lg:p-16 rounded-[3rem] shadow-2xl border border-[#e2e8f0]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Calendar Section */}
              <div>
                <h2 className="text-2xl font-black mb-8">1. Select a Date</h2>
                {loading ? (
                  <div className="flex flex-col items-center py-12">
                    <div className="w-8 h-8 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-[#64748b] text-sm">Loading available dates...</p>
                  </div>
                ) : (
                  <div className="bg-[#f8fafc] rounded-3xl border border-[#e2e8f0] p-6">
                    <div className="flex items-center justify-between mb-6">
                      <button
                        type="button"
                        className="p-2 hover:bg-white rounded-xl transition-colors text-[#64748b]"
                        onClick={() =>
                          setCalendarMonth(
                            new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                          )
                        }
                      >
                        ←
                      </button>
                      <div className="font-bold text-[#0f172a]">
                        {calendarMonth.toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                      <button
                        type="button"
                        className="p-2 hover:bg-white rounded-xl transition-colors text-[#64748b]"
                        onClick={() =>
                          setCalendarMonth(
                            new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                          )
                        }
                      >
                        →
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-7 text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-4 text-center">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                        <div key={d} className="py-2">{d}</div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
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
                            className={`h-10 rounded-xl text-sm font-bold transition-all ${
                              disabled
                                ? 'text-[#cbd5e1] cursor-not-allowed opacity-40'
                                : isSelected
                                ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20 scale-110'
                                : 'text-[#0f172a] hover:bg-white hover:shadow-md'
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                    {minDate && maxDate && (
                      <p className="mt-6 text-[10px] text-[#94a3b8] font-bold text-center uppercase tracking-widest">
                        Available from {new Date(minDate).toLocaleDateString()} to {new Date(maxDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Time Section */}
              <div>
                <h2 className="text-2xl font-black mb-8">2. Select a Time</h2>
                {!selectedDate ? (
                  <div className="h-[300px] border-2 border-dashed border-[#e2e8f0] rounded-3xl flex items-center justify-center p-8 text-center">
                    <p className="text-[#94a3b8] text-sm italic">Choose a date to see available times.</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="mb-6 font-bold text-[#10b981] bg-[#10b981]/10 px-4 py-2 rounded-xl inline-block">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    
                    {timeSlots.length === 0 ? (
                      <div className="p-8 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-sm font-medium">
                        No available time slots for this date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                              selectedSlot?.id === slot.id
                                ? 'border-[#10b981] bg-[#10b981]/5 text-[#0f172a]'
                                : 'border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1] hover:text-[#0f172a]'
                            }`}
                          >
                            {slot.start_time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Form Section */}
            <div className="mt-16 pt-16 border-t border-[#f1f5f9]">
              <h2 className="text-2xl font-black mb-10">3. Your Information</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#0f172a] ml-1">Full Name *</label>
                  <input
                    className="w-full px-6 py-4 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-2xl focus:border-[#10b981] focus:outline-none transition-all"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#0f172a] ml-1">Work Email *</label>
                  <input
                    className="w-full px-6 py-4 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-2xl focus:border-[#10b981] focus:outline-none transition-all"
                    type="email"
                    placeholder="you@company.sg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#0f172a] ml-1">Phone Number (Optional)</label>
                  <input
                    className="w-full px-6 py-4 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-2xl focus:border-[#10b981] focus:outline-none transition-all"
                    placeholder="+65 0000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#0f172a] ml-1">Additional Notes (Optional)</label>
                  <input
                    className="w-full px-6 py-4 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-2xl focus:border-[#10b981] focus:outline-none transition-all"
                    placeholder="Any specific topics?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-2 pt-6">
                  <button
                    type="submit"
                    className="btn btn-primary w-full py-5 text-xl font-black shadow-lg shadow-[#10b981]/20"
                  >
                    Confirm Demo Booking
                  </button>
                  <p className="text-center text-[#94a3b8] text-sm mt-4 font-medium italic">
                    We'll send a confirmation email with the meeting link.
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
