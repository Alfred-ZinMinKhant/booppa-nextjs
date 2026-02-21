"use client";

import React from 'react';
import { Eye, TrendingUp, AlertTriangle, ShieldAlert, LineChart as ChartIcon, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const INDEX_DATA = [
  { p: 'Jun', score: 65, triggers: 12 },
  { p: 'Jul', score: 68, triggers: 18 },
  { p: 'Aug', score: 66, triggers: 15 },
  { p: 'Sep', score: 72, triggers: 24 },
  { p: 'Oct', score: 78, triggers: 45 },
  { p: 'Nov', score: 85, triggers: 62 },
];

export default function AdminIntelligence() {
  return (
    <div className="min-h-screen bg-neutral-100 p-8 text-neutral-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-end border-b border-neutral-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Ecosystem Intelligence</h1>
            <p className="text-neutral-500 mt-2">Macro trends across vendor compliance and enterprise procurement signals.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white text-neutral-700 rounded-md border border-neutral-300 shadow-sm text-sm font-medium hover:bg-neutral-50 transition">
              Export PDF Report
            </button>
            <button className="px-4 py-2 bg-neutral-900 text-white rounded-md shadow-sm text-sm font-medium hover:bg-neutral-800 transition">
              Refresh Data
            </button>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-lg border bg-card text-card-foreground border-neutral-200 shadow-sm bg-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-500 text-sm font-medium">Global Pulse Score</p>
                  <h3 className="text-3xl font-bold text-neutral-900 mt-2">81.4</h3>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+5.2% vs last month</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground border-neutral-200 shadow-sm bg-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-500 text-sm font-medium">Active Procurement Windows</p>
                  <h3 className="text-3xl font-bold text-neutral-900 mt-2">412</h3>
                </div>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-md">
                  <Eye className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+24 detected today</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground border-neutral-200 shadow-sm bg-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-500 text-sm font-medium">Vulnerable Vectors (High Risk)</p>
                  <h3 className="text-3xl font-bold text-neutral-900 mt-2">14</h3>
                </div>
                <div className="p-2 bg-red-50 text-red-600 rounded-md">
                  <ShieldAlert className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-red-600 font-medium">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>Requires immediate review</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 shadow-sm bg-white bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-300 text-sm font-medium">Enterprise Lead Value</p>
                  <h3 className="text-3xl font-bold text-white mt-2">$4.1M</h3>
                </div>
                <div className="p-2 bg-white/10 text-white rounded-md">
                  <ChartIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-emerald-400 font-medium">
                <span>Value of triggered pipelines</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Index Trend */}
          <div className="rounded-lg border bg-card text-card-foreground border-neutral-200 shadow-sm bg-white">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <h3 className="text-lg font-semibold leading-none tracking-tight text-neutral-900">Ecosystem Index Over Time</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={INDEX_DATA}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis dataKey="p" axisLine={false} tickLine={false} stroke="#737373" />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} stroke="#737373" />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} stroke="#737373" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Avg Compliance Score" />
                    <Area yAxisId="right" type="monotone" dataKey="triggers" stroke="#10b981" strokeDasharray="5 5" fill="transparent" name="Active Triggers" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top High-Intent Enterprises */}
          <div className="rounded-lg border bg-card text-card-foreground border-neutral-200 shadow-sm bg-white">
            <div className="flex flex-col space-y-1.5 p-6 flex-row justify-between items-center pb-2">
              <h3 className="text-lg font-semibold leading-none tracking-tight text-neutral-900">Top High-Intent Enterprises</h3>
              <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-4 mt-4">
                {[
                  { domain: 'enterprisesg.gov.sg', score: 96, industry: 'Government', value: '$850k', status: 'Triggered' },
                  { domain: 'singtel.com', score: 92, industry: 'Telecommunications', value: '$450k', status: 'Monitoring' },
                  { domain: 'capitaland.com', score: 88, industry: 'Real Estate', value: '$220k', status: 'Monitoring' },
                  { domain: 'iras.gov.sg', score: 85, industry: 'Government', value: '$500k', status: 'Monitoring' },
                  { domain: 'shopee.com', score: 81, industry: 'E-commerce', value: '$180k', status: 'New Signal' }
                ].map((org, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border border-neutral-100 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition">
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-900">{org.domain}</span>
                      <span className="text-xs text-neutral-500">{org.industry}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="block text-sm font-bold text-neutral-700">{org.score}</span>
                        <span className="text-[10px] uppercase tracking-wider text-neutral-500">Intent Score</span>
                      </div>
                      <div className="w-24">
                        <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${org.score > 90 ? 'bg-emerald-500' : org.score > 80 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                            style={{width: `${org.score}%`}}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right w-20">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          org.status === 'Triggered' ? 'bg-emerald-100 text-emerald-700' : 
                          org.status === 'Monitoring' ? 'bg-blue-100 text-blue-700' : 
                          'bg-neutral-200 text-neutral-700'
                        }`}>
                          {org.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
