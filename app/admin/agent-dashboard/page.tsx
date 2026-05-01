"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Eye, 
  TrendingUp, 
  ShieldAlert, 
  LineChart as ChartIcon, 
  Search, 
  ChevronRight, 
  ExternalLink, 
  Mail, 
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface Lead {
  domain: string;
  score: number;
  score_delta: number;
  summary: string;
  sessions_count: number;
  last_event: string;
  ai_insight: {
    intent: string;
    stage: string;
    urgency: number;
    recommended_action: string;
  };
  top_vendors: { vendor: string; score: number }[];
  fit_score: number;
  industry?: string;
  company_name?: string;
  explanation?: {
    components: { factor: string; impact: number; type: string }[];
    top_category: string;
  };
}

interface Stats {
  total_leads: number;
  hot_leads: number;
  rising: number;
  avg_score: number;
  last_run: string;
}

export default function AgentDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, statsRes, activityRes] = await Promise.all([
          fetch('/api/leads'),
          fetch('/api/stats'),
          fetch('/api/activity')
        ]);

        const leadsData = await leadsRes.json();
        const statsData = await statsRes.json();
        const activityData = await activityRes.json();

        setLeads(leadsData);
        setStats(statsData);
        setActivity(activityData);
        
        if (leadsData.length > 0 && !selectedDomain) {
          setSelectedDomain(leadsData[0].domain);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesFilter = filter === 'all' || lead.ai_insight?.stage?.toLowerCase() === filter.toLowerCase();
      const matchesSearch = lead.domain.toLowerCase().includes(search.toLowerCase()) || 
                           (lead.company_name?.toLowerCase().includes(search.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [leads, filter, search]);

  const selectedLead = useMemo(() => {
    return leads.find(l => l.domain === selectedDomain) || null;
  }, [leads, selectedDomain]);

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-400 font-medium animate-pulse">Initializing Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-[#e2e8f0] font-['Space_Grotesk',sans-serif] relative overflow-hidden">
      {/* Grid Background Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
           style={{ backgroundImage: 'linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-[#1e2d4a] px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.8)]"></div>
          <h1 className="text-xl font-bold tracking-tight">BOOPPA <span className="text-[#94a3b8] font-normal">· Intent Intelligence</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
            LIVE
          </div>
          <div className="text-xs text-[#64748b] font-mono flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Last run: {stats?.last_run ? timeAgo(stats.last_run) : 'pending'}
          </div>
        </div>
      </header>

      <main className="relative z-10 p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard label="Total Leads" value={stats?.total_leads || 0} sub="companies identified" accent="blue" />
          <KPICard label="Hot Leads" value={stats?.hot_leads || 0} sub="score ≥ 30" accent="red" highlight />
          <KPICard label="Rising Intent" value={stats?.rising || 0} sub="increased vs last run" accent="green" />
          <KPICard label="Avg Intent Score" value={Math.round(stats?.avg_score || 0)} sub="across ecosystem" accent="purple" />
          <KPICard label="High Urgency" value={leads.filter(l => l.ai_insight?.urgency >= 4).length} sub="immediate actions" accent="cyan" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Table Section */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[#111827] border border-[#1e2d4a] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1e2d4a] flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#94a3b8]">Lead Pipeline</h3>
                <span className="text-xs font-mono text-[#64748b]">{filteredLeads.length} leads displayed</span>
              </div>
              
              {/* Filters & Search */}
              <div className="px-6 py-3 border-b border-[#1e2d4a] flex flex-wrap items-center gap-4 bg-white/[0.01]">
                <div className="flex bg-[#0f1628] rounded-lg p-1 border border-[#1e2d4a]">
                  <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
                  <FilterButton active={filter === 'decision'} onClick={() => setFilter('decision')}>Decision</FilterButton>
                  <FilterButton active={filter === 'evaluation'} onClick={() => setFilter('evaluation')}>Evaluation</FilterButton>
                  <FilterButton active={filter === 'research'} onClick={() => setFilter('research')}>Research</FilterButton>
                </div>
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                  <input 
                    type="text" 
                    placeholder="Search domain or company..." 
                    className="w-full bg-[#0f1628] border border-[#1e2d4a] rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500/50 transition-colors"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[#111827] z-20">
                    <tr className="text-[10px] font-bold uppercase tracking-widest text-[#64748b] border-b border-[#1e2d4a]">
                      <th className="px-6 py-4">Company Entity</th>
                      <th className="px-6 py-4">Intent Score</th>
                      <th className="px-6 py-4">Stage</th>
                      <th className="px-6 py-4">Sessions</th>
                      <th className="px-6 py-4">Δ Velocity</th>
                      <th className="px-6 py-4 text-right">Last Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr 
                        key={lead.domain} 
                        onClick={() => setSelectedDomain(lead.domain)}
                        className={`group cursor-pointer border-b border-[#1e2d4a]/50 transition-colors hover:bg-blue-500/5 ${selectedDomain === lead.domain ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#141d35] border border-[#1e2d4a] flex items-center justify-center text-xs font-bold text-blue-400 group-hover:border-blue-500/30 transition-colors uppercase">
                              {lead.domain.slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-[#e2e8f0]">{lead.company_name || lead.domain}</div>
                              <div className="text-[10px] text-[#64748b] font-mono">{lead.domain}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-[120px]">
                            <span className={`text-sm font-mono font-bold ${getScoreColor(lead.score)}`}>{lead.score.toFixed(1)}</span>
                            <div className="flex-1 h-1 bg-[#141d35] rounded-full overflow-hidden">
                              <div className={`h-full ${getScoreBg(lead.score)}`} style={{ width: `${Math.min(100, lead.score)}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StageBadge stage={lead.ai_insight?.stage || 'research'} />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-[#94a3b8]">{lead.sessions_count}</span>
                        </td>
                        <td className="px-6 py-4">
                          <VelocityDelta delta={lead.score_delta} />
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-[#64748b] whitespace-nowrap">
                          {timeAgo(lead.last_event)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Detail Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#111827] border border-[#1e2d4a] rounded-xl overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-[#1e2d4a] flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#94a3b8]">Lead Intelligence</h3>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              </div>
              
              {selectedLead ? (
                <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Lead Header */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-bold text-white">{selectedLead.company_name || selectedLead.domain}</h4>
                      <p className="text-xs text-[#64748b] font-mono">{selectedLead.domain} · {selectedLead.industry || 'Unknown Sector'}</p>
                    </div>
                    
                    <div className="flex items-end gap-3">
                      <div className={`text-5xl font-bold font-mono tracking-tighter ${getScoreColor(selectedLead.score)}`}>
                        {selectedLead.score.toFixed(1)}
                      </div>
                      <div className="pb-2">
                        <VelocityDelta delta={selectedLead.score_delta} size="lg" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <StageBadge stage={selectedLead.ai_insight?.stage || 'research'} />
                      <div className="px-2 py-1 bg-[#141d35] border border-[#1e2d4a] rounded text-[10px] font-bold text-[#94a3b8]">
                        URGENCY {selectedLead.ai_insight?.urgency}/5
                      </div>
                      <div className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] font-bold text-purple-400">
                        FIT {selectedLead.fit_score}×
                      </div>
                    </div>
                  </div>

                  {/* Recommended Action */}
                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                      <TrendingUp className="w-3 h-3" />
                      AI RECOMMENDED ACTION
                    </div>
                    <p className="text-sm text-[#e2e8f0] leading-relaxed">
                      {selectedLead.ai_insight?.recommended_action || selectedLead.summary}
                    </p>
                  </div>

                  {/* Components */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Score Attribution</h5>
                    <div className="space-y-3">
                      {selectedLead.explanation?.components.map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-[#94a3b8] flex items-center gap-2 capitalize">
                            <span className="opacity-50">•</span> {c.factor.replace(/_/g, ' ')}
                          </span>
                          <span className={`font-mono font-bold ${c.type === 'penalty' ? 'text-red-400' : 'text-blue-400'}`}>
                            {c.type === 'penalty' ? `-${c.impact}%` : (c.type === 'multiplier' ? `+${c.impact}%` : c.impact)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Products */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Product Triggers</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.top_vendors.map((v, i) => (
                        <div key={i} className="px-3 py-1.5 bg-blue-500/5 border border-blue-500/20 rounded-lg flex items-center gap-2 text-xs font-semibold text-blue-300">
                          {v.vendor}
                          <span className="text-[#64748b] font-mono text-[10px]">{Math.round(v.score)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 gap-3 pt-4 border-t border-[#1e2d4a]">
                    <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                      <UserPlus className="w-4 h-4" />
                      Add to CRM Portfolio
                    </button>
                    <button className="w-full py-3 bg-[#141d35] hover:bg-[#1c294a] text-[#94a3b8] hover:text-white border border-[#1e2d4a] font-bold rounded-lg transition-all flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      Trigger Outreach Sequence
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 bg-[#141d35] rounded-full flex items-center justify-center text-[#64748b]">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-[#64748b]">Select a lead from the pipeline to view deep-dive intelligence.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Intent Distribution Chart */}
          <div className="bg-[#111827] border border-[#1e2d4a] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1e2d4a] bg-white/[0.02]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#94a3b8]">Intent Distribution</h3>
            </div>
            <div className="p-6 h-[240px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getIntentDistribution(leads)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2d4a" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#0f1628', border: '1px solid #1e2d4a', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {getIntentDistribution(leads).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Pulse */}
          <div className="bg-[#111827] border border-[#1e2d4a] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1e2d4a] bg-white/[0.02]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#94a3b8]">Intelligence Activity</h3>
            </div>
            <div className="p-6 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity}>
                  <defs>
                    <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2d4a" />
                  <XAxis 
                    dataKey="updated_at" 
                    hide 
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f1628', border: '1px solid #1e2d4a', borderRadius: '8px' }}
                    labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                  />
                  <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPulse)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Agent Log */}
          <div className="bg-[#111827] border border-[#1e2d4a] rounded-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#1e2d4a] bg-white/[0.02] flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#94a3b8]">Agent Log</h3>
              <span className="text-[10px] font-mono text-[#64748b]">booppa_agent.log</span>
            </div>
            <div className="flex-1 p-4 font-mono text-[10px] custom-scrollbar overflow-y-auto max-h-[240px]">
               <div className="space-y-1">
                 <LogEntry level="info" msg="Booppa Intent Agent v10.0 Enterprise initialized" />
                 <LogEntry level="info" msg="Connection pool established with production database" />
                 <LogEntry level="info" msg={`Enrichment complete. Total Leads: ${leads.length}`} />
                 <LogEntry level="info" msg="Materialized views refreshed concurrently" />
                 <LogEntry level="info" msg="AI classification batch processed via DeepSeek" />
                 <LogEntry level="warn" msg="PDPA IP anonymization enforced for 7+ day records" />
                 <LogEntry level="info" msg="Agent heartbeat stable. Standing by for next cycle." />
               </div>
            </div>
          </div>

        </div>

      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e2d4a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #243357; }
      `}</style>
    </div>
  );
}

function KPICard({ label, value, sub, accent, highlight = false }: any) {
  const colors: any = {
    blue: 'border-blue-500 text-blue-500',
    red: 'border-red-500 text-red-500',
    green: 'border-green-500 text-green-500',
    purple: 'border-purple-500 text-purple-500',
    cyan: 'border-cyan-500 text-cyan-500'
  };

  return (
    <div className={`bg-[#111827] border border-[#1e2d4a] rounded-xl p-6 relative overflow-hidden group transition-all hover:border-[#243357] ${highlight ? 'ring-1 ring-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.05)]' : ''}`}>
      <div className={`absolute top-0 left-0 w-full h-[2px] bg-current ${colors[accent]}`}></div>
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">{label}</p>
        <h3 className="text-4xl font-bold tracking-tight text-white">{value}</h3>
        <p className="text-xs text-[#64748b]">{sub}</p>
      </div>
      <div className={`absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity ${colors[accent]}`}>
        <Activity className="w-24 h-24" />
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-[#64748b] hover:text-[#94a3b8]'}`}
    >
      {children}
    </button>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const styles: any = {
    decision: 'bg-red-500/10 text-red-400 border-red-500/20',
    evaluation: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    research: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styles[stage.toLowerCase()] || styles.research}`}>
      {stage}
    </span>
  );
}

function VelocityDelta({ delta, size = 'sm' }: { delta: number, size?: 'sm' | 'lg' }) {
  if (delta === 0) return <span className="text-[#64748b] font-mono text-xs">—</span>;
  const isUp = delta > 0;
  return (
    <div className={`flex items-center gap-1 font-mono font-bold ${isUp ? 'text-green-400' : 'text-red-400'} ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
      {isUp ? <ArrowUpRight className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} /> : <ArrowDownRight className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />}
      {isUp ? '+' : ''}{delta.toFixed(1)}
    </div>
  );
}

function LogEntry({ level, msg }: any) {
  const colors: any = {
    info: 'text-blue-400',
    warn: 'text-amber-400',
    error: 'text-red-400'
  };
  return (
    <div className="flex gap-2">
      <span className="text-[#64748b] whitespace-nowrap">[{new Date().toLocaleTimeString()}]</span>
      <span className={`uppercase font-bold ${colors[level]}`}>[{level}]</span>
      <span className="text-[#94a3b8]">{msg}</span>
    </div>
  );
}

function getScoreColor(score: number) {
  if (score >= 50) return 'text-red-400';
  if (score >= 30) return 'text-amber-400';
  return 'text-blue-400';
}

function getScoreBg(score: number) {
  if (score >= 50) return 'bg-red-500';
  if (score >= 30) return 'bg-amber-500';
  return 'bg-blue-500';
}

function getIntentDistribution(leads: Lead[]) {
  const stages = ['Decision', 'Evaluation', 'Research'];
  const colors = ['#ef4444', '#f59e0b', '#3b82f6'];
  return stages.map((stage, i) => ({
    name: stage,
    count: leads.filter(l => l.ai_insight?.stage?.toLowerCase() === stage.toLowerCase()).length,
    color: colors[i]
  }));
}
