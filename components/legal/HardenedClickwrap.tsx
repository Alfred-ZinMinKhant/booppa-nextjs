'use client'

import { useState } from 'react'
import Link from 'next/link'

interface HardenedClickwrapProps {
  onValidityChange: (valid: boolean) => void
  variant?: 'dark' | 'light'
}

const ITEMS = [
  <>
    I have read and agree to Booppa&apos;s{' '}
    <Link href="/terms" className="underline hover:opacity-80" target="_blank">Terms of Service</Link>,{' '}
    <Link href="/privacy" className="underline hover:opacity-80" target="_blank">Privacy Policy</Link>, and{' '}
    <Link href="/disclaimer" className="underline hover:opacity-80" target="_blank">Disclaimer</Link>.
  </>,
  'I acknowledge that I do not rely, and have not relied, on any Booppa output — including scores, rankings, probability estimates, or reports — for any legal, financial, procurement, or regulatory decision.',
  'I understand that Booppa is an information tool and not a legal, compliance, or procurement advisor.',
]

export default function HardenedClickwrap({
  onValidityChange,
  variant = 'dark',
}: HardenedClickwrapProps) {
  const [checked, setChecked] = useState([false, false, false])

  function toggle(i: number) {
    const next = checked.map((v, j) => (j === i ? !v : v))
    setChecked(next)
    onValidityChange(next.every(Boolean))
  }

  const labelClass =
    variant === 'light'
      ? 'text-xs text-[#64748b] leading-relaxed'
      : 'text-xs text-neutral-400 leading-relaxed'

  const checkboxClass =
    variant === 'light'
      ? 'mt-0.5 h-4 w-4 flex-shrink-0 rounded border-[#cbd5e1] accent-[#10b981] cursor-pointer'
      : 'mt-0.5 h-4 w-4 flex-shrink-0 rounded border-neutral-600 bg-neutral-800 accent-emerald-500 cursor-pointer'

  return (
    <div className="space-y-3">
      {ITEMS.map((text, i) => (
        <label key={i} className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={checked[i]}
            onChange={() => toggle(i)}
            className={checkboxClass}
          />
          <span className={`${labelClass} group-hover:opacity-80 transition-opacity`}>
            {text}
          </span>
        </label>
      ))}
    </div>
  )
}
