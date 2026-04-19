export const INDUSTRY_OPTIONS = [
  'Aerospace & Defence',
  'Construction & Engineering',
  'Consulting & Professional Services',
  'Education & Training',
  'Energy & Utilities',
  'Financial Services',
  'Food & Beverage',
  'Healthcare & Pharmaceuticals',
  'Information Technology',
  'Logistics & Transportation',
  'Manufacturing',
  'Marine & Offshore',
  'Media & Communications',
  'Real Estate & Property',
  'Retail & E-Commerce',
  'Telecommunications',
  'Other',
] as const

export type Industry = (typeof INDUSTRY_OPTIONS)[number]
