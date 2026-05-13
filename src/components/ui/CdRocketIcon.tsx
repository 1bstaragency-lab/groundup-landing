export function CdRocketIcon({ size = 16, className = '' }: { size?: number; strokeWidth?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* CD outer ring */}
      <circle cx="12" cy="12" r="10" />
      {/* CD inner rings */}
      <circle cx="12" cy="12" r="6.5" strokeWidth={0.6} strokeOpacity={0.4} />
      <circle cx="12" cy="12" r="3.5" strokeWidth={0.5} strokeOpacity={0.25} />
      {/* Center hole */}
      <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity={0.12} strokeWidth={0.8} />
      {/* Rocket body — bursting through center */}
      <path d="M12 2.5 C10 5.5 10 8 10 9.5 L12 11 L14 9.5 C14 8 14 5.5 12 2.5Z" fill="currentColor" fillOpacity={0.9} strokeWidth={0} />
      {/* Rocket nose */}
      <path d="M11 9.5 L13 9.5 L14 12 L10 12 Z" fill="currentColor" fillOpacity={0.7} strokeWidth={0} />
      {/* Rocket fins */}
      <path d="M10 10.5 L8.5 13 L10 12 Z" fill="currentColor" fillOpacity={0.6} strokeWidth={0} />
      <path d="M14 10.5 L15.5 13 L14 12 Z" fill="currentColor" fillOpacity={0.6} strokeWidth={0} />
      {/* Flame */}
      <path d="M11 12 Q11.5 14.5 12 13.5 Q12.5 14.5 13 12" fill="currentColor" fillOpacity={0.4} strokeWidth={0} />
    </svg>
  );
}
