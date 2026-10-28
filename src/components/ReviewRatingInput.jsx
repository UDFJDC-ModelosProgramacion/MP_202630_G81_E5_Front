import { MAX_RATING } from '../utils/reviewValidation';
import { getRatingHint } from '../utils/reviewFormatters';

const POSITIONS = Array.from({ length: MAX_RATING }, (_, index) => index + 1);

export default function ReviewRatingInput({ value, error, onChange }) {
  const selected = Number(value);
  const describedBy = error ? 'rating-hint rating-error' : 'rating-hint';

  return (
    <fieldset className="review-rating" aria-describedby={describedBy}>
      <legend className="form-field__label">Calificación</legend>
      <div className="review-rating__options">
        {POSITIONS.map((position) => (
          <label key={position} className="review-rating__option">
            <input
              type="radio"
              id={position === 1 ? 'rating' : undefined}
              name="rating"
              value={position}
              className="visually-hidden review-rating__input"
              checked={selected === position}
              aria-invalid={error ? 'true' : undefined}
              onChange={() => onChange(position)}
            />
            <span
              className={`review-rating__star${position <= selected ? ' review-rating__star--filled' : ''}`}
              aria-hidden="true"
            >
              ★
            </span>
            <span className="visually-hidden">
              {position} {position === 1 ? 'estrella' : 'estrellas'}
            </span>
          </label>
        ))}
      </div>
      <p id="rating-hint" className="review-rating__hint">
        {getRatingHint(selected)}
      </p>
      {error && (
        <div id="rating-error" className="form-field__error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6M12 16.5v.5" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </fieldset>
  );
}
