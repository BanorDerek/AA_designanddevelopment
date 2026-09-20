export default function WhatsAppIcon({ size = 20, ...props }) {
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
      <path d="M12 3a9 9 0 0 0-7.75 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" />
      <path d="M8.5 8.5c0 4 3 7 7 7 .8 0 1-.7 1-1.3s-.3-.9-.7-1l-1.6-.7c-.4-.2-.8 0-1 .3l-.3.5c-1.2-.6-2.2-1.6-2.8-2.8l.5-.3c.3-.2.5-.6.3-1l-.7-1.6c-.1-.4-.5-.7-1-.7-.6 0-1.3.2-1.3 1Z" />
    </svg>
  );
}