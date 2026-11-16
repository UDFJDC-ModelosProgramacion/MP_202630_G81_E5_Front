import { useState } from 'react';

export default function useEntityForm({ initialValues, validate, onSubmit, getErrorMessage }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError(null);

    const validationErrors = validate(values);
    setErrors(validationErrors);
    const firstInvalid = Object.keys(validationErrors)[0];
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setServerError(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  const controlProps = (name, extraClass = '') => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    className: `form-control-brand${extraClass}${errors[name] ? ' form-control-brand--invalid' : ''}`,
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  return { errors, serverError, submitting, handleSubmit, controlProps };
}