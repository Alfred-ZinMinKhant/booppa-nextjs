'use client'

import { useState, useEffect, FormEvent } from 'react'
import { User, Mail, Building2, Hash, Save, Loader2, CheckCircle, AlertCircle, Factory } from 'lucide-react'
import { INDUSTRY_OPTIONS } from '@/lib/industries'

interface Profile {
  id: string
  email: string
  company: string | null
  industry: string | null
  role: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/vendor/profile')
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setProfile(data)
          setCompany(data.company || '')
          setIndustry(data.industry || '')
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const res = await fetch('/api/vendor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, industry: industry || undefined }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.detail || 'Save failed')
      } else {
        setSuccess('Profile updated.')
        setProfile(prev => prev ? { ...prev, company, industry } : prev)
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="border-b border-neutral-800 pb-6">
          <h1 className="text-2xl font-bold text-white">Vendor Profile</h1>
          <p className="text-neutral-400 text-sm mt-1">Manage your account details</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">

          {/* Read-only fields */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                Account ID
              </label>
              <div className="flex items-center gap-2 bg-neutral-800 rounded-lg px-4 py-2.5">
                <Hash className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                <span className="text-neutral-400 text-sm font-mono">{profile?.id}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="flex items-center gap-2 bg-neutral-800 rounded-lg px-4 py-2.5">
                <Mail className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                <span className="text-neutral-300 text-sm">{profile?.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <div className="flex items-center gap-2 bg-neutral-800 rounded-lg px-4 py-2.5">
                <User className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                <span className="text-neutral-300 text-sm">{profile?.role}</span>
              </div>
            </div>
          </div>

          {/* Editable form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Company name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Acme Pte Ltd"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Industry
              </label>
              <div className="relative">
                <Factory className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 appearance-none"
                >
                  <option value="">Select your industry</option>
                  {INDUSTRY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-lg transition text-sm"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
