export default function AlertMessage({ children, variant = 'error' }) {
  const isError = variant === 'error';

  return (
    <div
      className={`alert-message alert-message--${variant}`}
      role={isError ? 'alert' : 'status'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        {isError ? <path d="M12 7v6M12 16.5v.5" /> : <path d="M8 12.5l3 3 5-6" />}
      </svg>
      <span>{children}</span>
    </div>
  );
}