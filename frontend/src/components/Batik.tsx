export function BatikCorner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const rotate = { tl: 0, tr: 90, br: 180, bl: 270 }[position]
  return (
    <svg
      className={`batik-corner batik-corner-${position}`}
      viewBox="0 0 50 50"
      aria-hidden="true"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <g stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M4 4 C4 24 20 40 40 40" />
        <path d="M4 4 C24 4 40 20 40 40" />
      </g>
      <g fill="currentColor">
        <circle cx="10" cy="10" r="2" />
        <circle cx="17" cy="17" r="1.5" />
        <circle cx="24" cy="24" r="2" />
        <circle cx="31" cy="31" r="1.5" />
        <circle cx="38" cy="38" r="1" />
      </g>
    </svg>
  )
}

export function Kawung({ size = 100 }: { size?: number }) {
  return (
    <svg
      className="kawung-motif"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <ellipse cx="50" cy="20" rx="10" ry="16" />
        <ellipse cx="50" cy="80" rx="10" ry="16" />
        <ellipse cx="20" cy="50" rx="16" ry="10" />
        <ellipse cx="80" cy="50" rx="16" ry="10" />
        <circle cx="50" cy="50" r="3" fill="currentColor" />
      </g>
    </svg>
  )
}

export function BatikDivider() {
  return (
    <svg className="batik-divider" viewBox="0 0 400 24" aria-hidden="true">
      <defs>
        <linearGradient id="bd-grad" x1="0" x2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1="12" x2="160" y2="12" stroke="url(#bd-grad)" strokeWidth="1" />
      <line x1="240" y1="12" x2="400" y2="12" stroke="url(#bd-grad)" strokeWidth="1" />
      <g transform="translate(200 12)" fill="currentColor">
        <path d="M-14 0 L-6 -5 L-6 5 Z" />
        <path d="M14 0 L6 -5 L6 5 Z" />
        <circle r="4" />
        <circle r="7" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      </g>
    </svg>
  )
}

export function ParangPattern({ className = '' }: { className?: string }) {
  // Motif parang: deretan huruf S diagonal yang saling terkait
  return (
    <svg
      className={`parang-pattern ${className}`}
      viewBox="0 0 200 200"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="parang-tile"
          x="0" y="0" width="40" height="40"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <path
            d="M0 20 Q10 5 20 20 T40 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.35"
          />
          <path
            d="M0 30 Q10 15 20 30 T40 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.2"
          />
          <circle cx="20" cy="20" r="1.5" fill="currentColor" opacity="0.25" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#parang-tile)" />
    </svg>
  )
}

export function MegaMendung({ className = '' }: { className?: string }) {
  // Motif awan bergelombang, khas Cirebon
  return (
    <svg
      className={`mega-mendung ${className}`}
      viewBox="0 0 300 80"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.28">
        <path d="M0 40 Q30 10 60 40 T120 40 T180 40 T240 40 T300 40" />
        <path d="M0 52 Q30 22 60 52 T120 52 T180 52 T240 52 T300 52" opacity="0.7" />
        <path d="M0 28 Q30 -2 60 28 T120 28 T180 28 T240 28 T300 28" opacity="0.5" />
      </g>
    </svg>
  )
}