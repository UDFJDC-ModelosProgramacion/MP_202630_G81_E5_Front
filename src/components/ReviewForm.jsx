import { useEffect, useState } from 'react';
import AlertMessage from './AlertMessage';
import FormField from './FormField';
import ReviewRatingInput from './ReviewRatingInput';
import { getReviewErrorMessage } from '../utils/reviewMessages';
import { validateReview } from '../utils/reviewValidation';

export default function ReviewForm({
  initialValues,
  submitLabel,
  focusOnMount,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const focusField = (name) => document.getElementById(name)?.focus();

  useEffect(() => {
    if (focusOnMount) document.getElementById('rating')?.focus();
  }, [focusOnMount]);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError(null);

    const validationErrors = validateReview(values);
    setErrors(validationErrors);
    const firstInvalid = Object.keys(validationErrors)[0];
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setServerError(getReviewErrorMessage(error));
    }
    setSubmitting(false);
  };

  return (
    <form className="form-card review-form" onSubmit={handleSubmit} noValidate>
      {serverError && <AlertMessage>{serverError}</AlertMessage>}

      <ReviewRatingInput
        value={values.rating}
        error={errors.rating}
        onChange={(rating) => handleChange('rating', rating)}
      />

      <FormField id="comment" label="Comentario" optional error={errors.comment}>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          value={values.comment}
          placeholder="Cuéntanos cómo fue tu experiencia"
          className={`form-control-brand review-form__comment${errors.comment ? ' form-control-brand--invalid' : ''}`}
          aria-invalid={errors.comment ? 'true' : undefined}
          aria-describedby={errors.comment ? 'comment-error' : undefined}
          onChange={(event) => handleChange('comment', event.target.value)}
        />
      </FormField>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-outline-brand" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn-brand" disabled={submitting}>
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
