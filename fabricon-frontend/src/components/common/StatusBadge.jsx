const VARIANT_CLASS = {
  success: 'fc-status-badge--success',
  danger: 'fc-status-badge--danger',
  warning: 'fc-status-badge--warning',
  neutral: 'fc-status-badge--neutral',
};

export function StatusBadge({ label, variant = 'neutral', showDot = true, pulse = false }) {
  return (
    <span className={`fc-status-badge ${VARIANT_CLASS[variant] || VARIANT_CLASS.neutral}`}>
      {showDot && (
        <span
          className={`fc-status-badge__dot ${pulse ? 'fc-pulse' : ''}`}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}
