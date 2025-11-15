export default function ThreeColIcon({ className = '', width = 18, height = 18 }: { className?: string; width?: number; height?: number }) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="5" height="16" rx="1" fill="currentColor" />
      <rect x="10" y="4" width="5" height="16" rx="1" fill="currentColor" />
      <rect x="17" y="4" width="5" height="16" rx="1" fill="currentColor" />
    </svg>
  );
}
