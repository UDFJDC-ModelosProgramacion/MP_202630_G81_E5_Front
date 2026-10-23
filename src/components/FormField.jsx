export default function FormField({ id, label, optional = false, error, children }) {
  return (
    <div className="form-field">
      <label htmlFor={id} className="form-field__label">
        {label}
        {optional && <span className="form-field__optional"> (opcional)</span>}
      </label>
      {children}
      {error && (
        <div id={`${id}-error`} className="form-field__error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6M12 16.5v.5" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}