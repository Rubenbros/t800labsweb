interface ServiceIconProps {
  name: string;
}

export function ServiceIcon({ name }: ServiceIconProps) {
  const props = { width: 24, height: 24, fill: "none", stroke: "currentColor", strokeWidth: 1.5 };

  switch (name) {
    case "scissors":
      return <svg {...props} viewBox="0 0 24 24"><path d="M6 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" /></svg>;
    case "palette":
      return <svg {...props} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zM6.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3-4a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3 4a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" /></svg>;
    case "sparkles":
      return <svg {...props} viewBox="0 0 24 24"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 16l.75 2.25L8 19l-2.25.75L5 22l-.75-2.25L2 19l2.25-.75L5 16z" /></svg>;
    case "user":
      return <svg {...props} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" /></svg>;
    case "crown":
      return <svg {...props} viewBox="0 0 24 24"><path d="M2 20h20M4 17l2-12 4 4 2-6 2 6 4-4 2 12H4z" /></svg>;
    case "heart":
      return <svg {...props} viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>;
    case "utensils":
      return <svg {...props} viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" /></svg>;
    case "wine":
      return <svg {...props} viewBox="0 0 24 24"><path d="M8 2h8l-2 9a4 4 0 01-4 0L8 2zM12 13v9M8 22h8" /></svg>;
    case "cake":
      return <svg {...props} viewBox="0 0 24 24"><path d="M2 18v2a2 2 0 002 2h16a2 2 0 002-2v-2M4 18v-5a2 2 0 012-2h12a2 2 0 012 2v5M12 4a2 2 0 00-2 2v5h4V6a2 2 0 00-2-2zM8 2v2M16 2v2M12 2v2" /></svg>;
    case "truck":
      return <svg {...props} viewBox="0 0 24 24"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /></svg>;
    case "users":
      return <svg {...props} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>;
    case "calendar":
      return <svg {...props} viewBox="0 0 24 24"><path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18" /></svg>;
    case "stethoscope":
      return <svg {...props} viewBox="0 0 24 24"><path d="M4.8 2.62L3 4.5s2 2.5 2 5c0 2.76-2.24 5-5 5M18 14a3 3 0 100-6 3 3 0 000 6zm0 0v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-1" /><path d="M7 14.5s2 2.5 2 5c0 2.76 2.24 5 5 5" /></svg>;
    case "tooth":
      return <svg {...props} viewBox="0 0 24 24"><path d="M12 2C8 2 5 5 5 8c0 4 2 6 3 10 .5 2 1.5 4 4 4s3.5-2 4-4c1-4 3-6 3-10 0-3-3-6-7-6z" /></svg>;
    case "eye":
      return <svg {...props} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
    case "bone":
      return <svg {...props} viewBox="0 0 24 24"><path d="M18.3 5.7a2.5 2.5 0 00-3.5 0L5.7 14.8a2.5 2.5 0 103.5 3.5l9.1-9.1a2.5 2.5 0 000-3.5z" /></svg>;
    case "baby":
      return <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 10-16 0" /></svg>;
    case "clipboard":
      return <svg {...props} viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>;
    case "wrench":
      return <svg {...props} viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>;
    case "car":
      return <svg {...props} viewBox="0 0 24 24"><path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a2 2 0 00-1.8 1.1l-.8 1.63A6 6 0 002 12.42V16h2" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></svg>;
    case "shield":
      return <svg {...props} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case "zap":
      return <svg {...props} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
    case "thermometer":
      return <svg {...props} viewBox="0 0 24 24"><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" /></svg>;
    case "search":
      return <svg {...props} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>;
    case "book":
      return <svg {...props} viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>;
    case "globe":
      return <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>;
    case "calculator":
      return <svg {...props} viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8M8 10h8M8 14h2M14 14h2M8 18h2M14 18h2" /></svg>;
    case "flask":
      return <svg {...props} viewBox="0 0 24 24"><path d="M9 3h6M10 3v6.5l-5.5 9a2 2 0 001.7 3h11.6a2 2 0 001.7-3L14 9.5V3" /></svg>;
    case "monitor":
      return <svg {...props} viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>;
    case "graduation":
      return <svg {...props} viewBox="0 0 24 24"><path d="M22 10l-10-5-10 5 10 5 10-5zM6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" /></svg>;
    case "shopping-bag":
      return <svg {...props} viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" /></svg>;
    case "tag":
      return <svg {...props} viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><circle cx="7" cy="7" r="1" fill="currentColor" /></svg>;
    case "gift":
      return <svg {...props} viewBox="0 0 24 24"><path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 100-5C13 2 12 7 12 7z" /></svg>;
    case "refresh":
      return <svg {...props} viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>;
    case "headphones":
      return <svg {...props} viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" /></svg>;
    case "dumbbell":
      return <svg {...props} viewBox="0 0 24 24"><path d="M6.5 6.5h11M6.5 17.5h11M3 10V6.5a1.5 1.5 0 013 0v11a1.5 1.5 0 01-3 0V14M21 10V6.5a1.5 1.5 0 00-3 0v11a1.5 1.5 0 003 0V14" /></svg>;
    case "heart-pulse":
      return <svg {...props} viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" /><path d="M3 12h4l3-6 4 12 3-6h4" /></svg>;
    case "apple":
      return <svg {...props} viewBox="0 0 24 24"><path d="M12 3c-1.5-1.5-4-2-6 0S4 7 4 10c0 5 4 9 8 12 4-3 8-7 8-12 0-3-1-5-2-7s-4.5-1.5-6 0z" /></svg>;
    case "target":
      return <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
    case "home":
      return <svg {...props} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
    case "key":
      return <svg {...props} viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>;
    case "building":
      return <svg {...props} viewBox="0 0 24 24"><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18zM6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4" /></svg>;
    case "chart":
      return <svg {...props} viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>;
    case "file-text":
      return <svg {...props} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>;
    case "compass":
      return <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>;
    default:
      return <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>;
  }
}
