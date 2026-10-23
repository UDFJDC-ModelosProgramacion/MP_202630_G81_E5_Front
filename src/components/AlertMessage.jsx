export default function AlertMessage({ children }) {
  return (
    <div className="alert-error" role="alert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6M12 16.5v.5" />
      </svg>
      <span>{children}</span>
    </div>
  );
}