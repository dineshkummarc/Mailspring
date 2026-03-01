import React from 'react';

interface EventPropertyRowProps {
  label?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const EventPropertyRow: React.FC<EventPropertyRowProps> = ({
  label,
  icon,
  children,
  className,
  onClick,
}) => {
  return (
    <div className={`event-property-row${className ? ` ${className}` : ''}`} onClick={onClick}>
      <div className="row-icon-area">
        {icon ?? (label ? <span className="row-label">{label}</span> : null)}
      </div>
      <div className="row-value">{children}</div>
    </div>
  );
};

// Shared icon components for calendar event property rows.
// All icons use currentColor so they respond to theme text color changes.
export const CalendarIcons = {
  Clock: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M6.5 3.5v3.25l2 1.25"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Arrow: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.5h8M7 3l3.5 3.5L7 10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Repeat: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path
        d="M2 4.5h7.5M8 2l2.5 2.5L8 7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 8.5H3.5M5 11 2.5 8.5 5 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Bell: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path
        d="M6.5 1.5C4.6 1.5 3 3.1 3 5v3.5L1.5 9.5h10L10 8.5V5c0-1.9-1.6-3.5-3.5-3.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.3 9.5c0 .7.5 1.2 1.2 1.2s1.2-.5 1.2-1.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  Globe: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="6.5" cy="6.5" rx="2.3" ry="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 6.5h11" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  Availability: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="6.5" cy="6.5" r="2" fill="currentColor" />
    </svg>
  ),
  Sun: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M6.5 1v1.5M6.5 10.5V12M12 6.5h-1.5M2.5 6.5H1M10.7 2.3l-1.1 1.1M3.4 9.6l-1.1 1.1M10.7 10.7l-1.1-1.1M3.4 3.4 2.3 2.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  MapPin: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path
        d="M6.5 1C4.6 1 3 2.6 3 4.5c0 2.8 3.5 7 3.5 7S10 7.3 10 4.5C10 2.6 8.4 1 6.5 1z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="6.5" cy="4.5" r="1.2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  Person: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2 12c0-2.5 2-4.5 4.5-4.5S11 9.5 11 12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  Note: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4 5h5M4 7h5M4 9h3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
};
