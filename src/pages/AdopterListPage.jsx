import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdopterTable from '../components/AdopterTable';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import useAdopters from '../hooks/useAdopters';
import { isNotFound } from '../services/apiError';
import { deleteAdopter } from '../services/adopterService';
import { getAdopterDeleteErrorMessage } from '../utils/adopterMessages';

export default function AdopterListPage() {
const { adopters, loading, error, reload, removeAdopter } = useAdopters();
const location = useLocation();
const [feedback, setFeedback] = useState(() =>
    location.state?.message ? { type: 'success', message: location.state.message } : null,
);
const [deletingId, setDeletingId] = useState(null);
const feedbackRef = useRef(null);

useEffect(() => {
    feedbackRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
}, [feedback]);

const handleDelete = async (adopter) => {
    if (!window.confirm(`¿Eliminar a ${adopter.name}? Esta acción no se puede deshacer.`)) {
    return;
    }

    setFeedback(null);
    setDeletingId(adopter.id);
    try {
    await deleteAdopter(adopter.id);
    removeAdopter(adopter.id);
    setFeedback({ type: 'success', message: `Adoptante ${adopter.name} eliminado correctamente.` });
    } catch (deleteError) {
    if (isNotFound(deleteError)) removeAdopter(adopter.id);
    setFeedback({ type: 'error', message: getAdopterDeleteErrorMessage(deleteError, adopter) });
    } finally {
    setDeletingId(null);
    }
};

return (
    <section>
    <div className="page-header">
        <div>
        <h1 className="page-title">Adoptantes</h1>
        <p className="page-subtitle">Consulta y administra los adoptantes registrados.</p>
        </div>
        <Link to="/adoptantes/nuevo" className="btn-brand">
        + Registrar adoptante
        </Link>
    </div>

    {feedback && (
        <div ref={feedbackRef}>
        <AlertMessage variant={feedback.type}>{feedback.message}</AlertMessage>
        </div>
)}
    {loading && <Loader label="Cargando adoptantes..." />}

    {!loading && error && (
        <>
        <AlertMessage>{error}</AlertMessage>
        <button type="button" className="btn-outline-brand" onClick={reload}>
            Reintentar
        </button>
        </>
    )}

    {!loading && !error && adopters.length === 0 && (
        <p className="empty-state">Aún no hay adoptantes registrados.</p>
    )}

    {!loading && !error && adopters.length > 0 && (
        <AdopterTable adopters={adopters} onDelete={handleDelete} deletingId={deletingId} />
    )}
    </section>
);
}
