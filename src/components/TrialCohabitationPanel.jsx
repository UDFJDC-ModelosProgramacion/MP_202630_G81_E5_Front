import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useTrialCohabitation from '../hooks/useTrialCohabitation';
import { formatAdoptionDate } from '../utils/adoptionFormatters';
import {
    TRIAL_COHABITATION_DELETED_MESSAGE,
    TRIAL_COHABITATION_NOT_FOUND_MESSAGE,
    getTrialCohabitationErrorMessage,
} from '../utils/trialCohabitationMessages';
import AlertMessage from './AlertMessage';
import Loader from './Loader';

    const DELETE_CONFIRMATION =
    '¿Eliminar la convivencia de prueba de esta adopción? Esta acción no se puede deshacer.';

    function TrialCohabitationDetails({ adoptionId, trialCohabitation, deleting, onDelete }) {
    const { startDate, endDate } = trialCohabitation;

    return (
        <>
        <dl className="detail-list">
            <div className="detail-list__item">
            <dt>Fecha de inicio</dt>
            <dd>{formatAdoptionDate(startDate)}</dd>
            </div>
            <div className="detail-list__item">
            <dt>Fecha de fin</dt>
            <dd>{endDate ? formatAdoptionDate(endDate) : 'Sin fecha de fin'}</dd>
            </div>
        </dl>
        <div className="detail-actions">
            <Link to={`/adopciones/${adoptionId}/convivencia-prueba/editar`} className="btn-outline-brand">
            Editar convivencia
            </Link>
            <button
            type="button"
            className="btn-outline-brand adoption-btn-danger"
            disabled={deleting}
            onClick={onDelete}
            >
            {deleting ? 'Eliminando...' : 'Eliminar convivencia'}
            </button>
        </div>
        </>
    );
    }

    function TrialCohabitationEmpty({ adoptionId }) {
    return (
        <>
        <p className="empty-state">{TRIAL_COHABITATION_NOT_FOUND_MESSAGE}</p>
        <div className="detail-actions">
            <Link to={`/adopciones/${adoptionId}/convivencia-prueba/nueva`} className="btn-brand">
            Registrar convivencia
            </Link>
        </div>
        </>
    );
    }

    export default function TrialCohabitationPanel({ adoptionId }) {
    const location = useLocation();
    const { trialCohabitation, loading, error, notFound, deleting, removeTrialCohabitation } =
        useTrialCohabitation(adoptionId);
    const [success, setSuccess] = useState(location.state?.message ?? null);
    const [actionError, setActionError] = useState(null);

    const handleDelete = async () => {
        if (!window.confirm(DELETE_CONFIRMATION)) return;

        setSuccess(null);
        setActionError(null);
        try {
        await removeTrialCohabitation();
        setSuccess(TRIAL_COHABITATION_DELETED_MESSAGE);
        } catch (failure) {
        setActionError(getTrialCohabitationErrorMessage(failure));
        }
    };

    const loadError = !loading && !notFound ? error : null;

    return (
        <section className="detail-card adoption-actions" aria-labelledby="trial-panel-title">
        <h2 id="trial-panel-title" className="adoption-actions__title">
            Convivencia de prueba
        </h2>

        {success && <AlertMessage variant="success">{success}</AlertMessage>}
        {actionError && <AlertMessage>{actionError}</AlertMessage>}
        {loadError && <AlertMessage>{loadError}</AlertMessage>}
        {loading && <Loader label="Cargando convivencia de prueba..." />}

        {!loading && notFound && <TrialCohabitationEmpty adoptionId={adoptionId} />}
        {!loading && trialCohabitation && (
            <TrialCohabitationDetails
            adoptionId={adoptionId}
            trialCohabitation={trialCohabitation}
            deleting={deleting}
            onDelete={handleDelete}
            />
        )}
        </section>
    );
}