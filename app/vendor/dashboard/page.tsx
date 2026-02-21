"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Eye, TrendingUp, AlertTriangle, ArrowRight, Bell, Zap, Building } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// In a real app, this data is fetched from the V6 OS backend `/api/vendor/dashboard`
const MOUNT_DATA = [
  { name: 'Mon', views: 4, triggers: 0 },
  { name: 'Tue', views: 7, triggers: 1 },
  { name: 'Wed', views: 12, triggers: 2 },
  { name: 'Thu', views: 28, triggers: 5 },
  { name: 'Fri', views: 45, triggers: 8 },
  { name: 'Sat', views: 42, triggers: 4 },
  { name: 'Sun', views: 56, triggers: 12 },
];

export default function VendorDashboard() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // Real implementation would connect to WebSocket here
    // import { io } from 'socket.io-client';
    // const socket = io(process.env.NEXT_PUBLIC_WS_URL);
    // socket.on('enterprise_visited', (data) => console.log(data));
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header section */}
        <div className="flex justify-between items-end border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Revenue Intelligence</h1>
            <p className="text-neutral-400 text-sm mt-1">Real-time enterprise procurement signals</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-neutral-900 text-white rounded-md border border-neutral-800 text-sm font-medium hover:bg-neutral-800 transition">
              Share Proof
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              Upgrade to Intel Pro
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg bg-neutral-900 border border-neutral-800 text-card-foreground shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-400 text-sm font-medium">Global Trust Score</p>
                  <h3 className="text-3xl font-bold text-white mt-2">78<span className="text-sm text-neutral-500 font-normal">/100</span></h3>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-emerald-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+4 pts from last assessment</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-neutral-900 border border-neutral-800 text-card-foreground shadow-[0_0_20px_rgba(16,185,129,0.05)]">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-400 text-sm font-medium">Enterprise Views (7d)</p>
                  <h3 className="text-3xl font-bold text-white mt-2">184</h3>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Eye className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-emerald-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+124% vs previous week</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-neutral-900 border border-neutral-800 text-card-foreground shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-400 text-sm font-medium">Active Procurements</p>
                  <h3 className="text-3xl font-bold text-white mt-2">3</h3>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Zap className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-amber-400">
                <span>Viewers actively buying in your sector</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-neutral-900 border border-neutral-800 text-card-foreground shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-400 text-sm font-medium">Gov Agencies</p>
                  <h3 className="text-3xl font-bold text-white mt-2">12</h3>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Building className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-purple-400">
                <span>Unique .gov.sg domains seen</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="rounded-lg bg-neutral-900 border border-neutral-800 text-card-foreground shadow-sm lg:col-span-2">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-medium text-neutral-200">Attention Trajectory</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOUNT_DATA}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTriggers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis dataKey="name" stroke="#525252" tick={{fill: '#a3a3a3', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#525252" tick={{fill: '#a3a3a3', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                    <Area type="monotone" dataKey="triggers" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorTriggers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-lg bg-neutral-900 border border-neutral-800 text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 border-b border-neutral-800 pb-2">
              <div className="flex flex-row items-center justify-between">
                <h3 className="text-base font-medium text-neutral-200">Live Signals</h3>
                <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
            </div>
            <div className="p-6 pt-4 px-0">
              <div className="space-y-0">
                {[
                  { domain: 'defence.gov.sg', type: 'High-Intent View', time: '2 mins ago', color: 'text-purple-400', bg: 'bg-purple-400/10' },
                  { domain: 'dbs.com.sg', type: 'Repeated Visit (3x)', time: '14 mins ago', color: 'text-amber-400', bg: 'bg-amber-400/10' },
                  { domain: 'Unknown Enterprise', type: 'First View', time: '1 hour ago', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { domain: 'tech.gov.sg', type: 'Proof Downloaded', time: '3 hours ago', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                ].map((item, i) => (
                  <div key={i} className="px-6 py-3 hover:bg-neutral-800/50 transition border-l-2 border-transparent hover:border-neutral-500 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-neutral-200">{item.domain}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium mt-1 ${item.bg} ${item.color}`}>
                          {item.type}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 mt-4">
                <button className="w-full py-2 text-sm text-neutral-400 hover:text-white transition flex items-center justify-center">
                  View full logs <ArrowRight className="ml-1 h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
