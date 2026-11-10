function icon(defaultStroke, children) {
  return function Icon(props) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={defaultStroke} {...props}>
        {children}
      </svg>
    );
  };
}

const heartPath = <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />;

export const HeartIcon = icon(1.8, heartPath);
export const HeartFilledIcon = (props) => <HeartIcon fill="currentColor" {...props} />;
export const EyeIcon = icon(1.8, (
  <>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </>
));
export const CompareIcon = icon(1.8, <path d="M7 4v16M17 4v16M4 8l3-4 3 4M14 16l3 4 3-4" />);
export const BagIcon = icon(1.6, (
  <>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </>
));
export const MenuIcon = icon(1.6, <path d="M3 7h18M3 12h18M3 17h18" />);
export const SearchIcon = icon(1.6, (
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>
));
export const TruckIcon = icon(1.5, (
  <>
    <path d="M2 7h12v9H2zM14 10h4l3 3v3h-7" />
    <circle cx="6" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </>
));
export const CardIcon = icon(1.5, (
  <>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 9h20M6 15h4" />
  </>
));
export const ChatIcon = icon(1.5, <path d="M3.5 20.5l1.3-3.9A8.5 8.5 0 1 1 8 19.6Z" />);
export const BulkIcon = icon(1.5, (
  <>
    <path d="M4 7h16M4 12h10M4 17h7" />
    <path d="m15 16 2 2 4-4" />
  </>
));
export const ReturnsIcon = icon(1.5, <path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4" />);

export function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}

export function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 8.5V7c0-.7.5-1 1-1h2V3h-2.8C11.9 3 11 4.8 11 6.7v1.8H9V12h2v9h3v-9h2.5l.5-3.5h-3Z" />
    </svg>
  );
}

export function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 3c.4 2.3 1.8 3.8 4 4v3.1a7 7 0 0 1-4-1.3v6.5a5.8 5.8 0 1 1-5-5.7v3.2a2.7 2.7 0 1 0 1.9 2.6V3h3.1Z" />
    </svg>
  );
}