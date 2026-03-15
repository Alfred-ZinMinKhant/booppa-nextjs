import { config, endpoints } from '@/lib/config'

interface TrustBadgeProps {
  reportId: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Embeddable trust badge showing verification status.
 * Renders as an img pointing to the backend SVG endpoint.
 */
export default function TrustBadge({ reportId, size = 'md' }: TrustBadgeProps) {
  const sizes = { sm: 100, md: 150, lg: 200 }
  const width = sizes[size]

  return (
    <a
      href={`${config.apiUrl}/api/v1${endpoints.widget.embed(reportId)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${config.apiUrl}/api/v1${endpoints.widget.badgeSvg(reportId)}`}
        alt="Booppa Verified"
        width={width}
        height={Math.round(width * 0.4)}
        loading="lazy"
      />
    </a>
  )
}
