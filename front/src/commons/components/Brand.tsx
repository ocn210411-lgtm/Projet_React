function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="url(#logo-gradient)" />
      <path
        d="M12 20.5 17 26l11-13"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#c026d3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Brand({ size = 38, wordmark = true, className = "" }: { size?: number; wordmark?: boolean; className?: string }) {
  return (
    <span className={`brand-lockup ${className}`}>
      <LogoMark size={size} />
      {wordmark && <span className="brand-lockup__name">Orbit<b>Task</b></span>}
    </span>
  );
}
