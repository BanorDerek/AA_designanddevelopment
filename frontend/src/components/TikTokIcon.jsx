// lucide-react doesn't ship a TikTok glyph, so this is a small hand-drawn
// stand-in kept in the same stroke style (24x24, currentColor, 2px stroke)
// as the lucide icons it sits next to in the toggle panel.
export default function TikTokIcon({ size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8.5a5.5 5.5 0 0 1-4-1.7V15a5 5 0 1 1-4-4.9" />
      <path d="M12 6.8V3h3.2a4.3 4.3 0 0 0 3.8 3.8" />
    </svg>
  );
}
