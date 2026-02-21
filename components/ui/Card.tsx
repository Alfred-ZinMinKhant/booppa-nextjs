import { clsx } from 'clsx'

interface Props { children: React.ReactNode; className?: string }

export function Card({ children, className }: Props) {
  return (
    <div className={clsx('bg-white rounded-lg shadow-md p-6', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: Props) {
  return <div className={clsx('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: Props) {
  return (
    <h3 className={clsx('text-xl font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className }: Props) {
  return <div className={className}>{children}</div>
}
