import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrialCohabitationErrorMessage } from '../utils/trialCohabitationMessages';
import { validateTrialCohabitation } from '../utils/trialCohabitationValidation';
import AlertMessage from './AlertMessage';
import FormField from './FormField';

const FIELDS = [
    { name: 'startDate', label: 'Fecha de inicio', optional: false },
    { name: 'endDate', label: 'Fecha de fin', optional: true },
    ];

    export default function TrialCohabitationForm({
    adoptionId,
    initialValues,
    title,
    submitLabel,
    onSubmit,
    }) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setValues((previous) => ({ ...previous, [name]: value }));
        setErrors((previous) => ({ ...previous, [name]: undefined }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setServerError(null);

        const validationErrors = validateTrialCohabitation(values);
        setErrors(validationErrors);

        const firstInvalid = Object.keys(validationErrors)[0];
        if (firstInvalid) {
        document.getElementById(firstInvalid)?.focus();
        return;
        }

        setSubmitting(true);
        try {
        await onSubmit(values);
        } catch (failure) {
        setServerError(getTrialCohabitationErrorMessage(failure));
        } finally {
        setSubmitting(false);
        }
    };

    return (
        <form
        className="form-card"
        aria-labelledby="trial-form-title"
        onSubmit={handleSubmit}
        noValidate
        >
        <h2 id="trial-form-title" className="return-card__title">
            {title}
        </h2>

        {serverError && <AlertMessage>{serverError}</AlertMessage>}

        {FIELDS.map(({ name, label, optional }) => (
            <FormField key={name} id={name} label={label} optional={optional} error={errors[name]}>
            <input
                id={name}
                name={name}
                type="date"
                value={values[name] ?? ''}
                onChange={handleChange}
                className={`form-control-brand${errors[name] ? ' form-control-brand--invalid' : ''}`}
                aria-invalid={errors[name] ? 'true' : undefined}
                aria-describedby={errors[name] ? `${name}-error` : undefined}
            />
            </FormField>
        ))}

        <div className="form-actions">
            <Link to={`/adopciones/${adoptionId}`} className="btn-outline-brand">
            Cancelar
            </Link>
            <button type="submit" className="btn-brand" disabled={submitting}>
            {submitting ? 'Guardando...' : submitLabel}
            </button>
        </div>
        </form>
    );
}