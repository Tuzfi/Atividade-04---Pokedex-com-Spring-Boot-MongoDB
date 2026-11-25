import type { ReactNode } from 'react'

type SpotlightCardProps = {
  children: ReactNode
  className?: string
}

export function SpotlightCard({
  children,
  className = '',
}: SpotlightCardProps) {
  return <article className={`spotlight-card ${className}`}>{children}</article>
}
  