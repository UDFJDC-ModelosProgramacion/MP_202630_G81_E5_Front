import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import ShelterTable from '../components/ShelterTable';
import useShelterList from '../hooks/useShelterList';
import { isNotFound } from '../services/apiError';
import { deleteShelter } from '../services/shelterService';
import { getDeleteErrorMessage } from '../utils/shelterMessages';

export default function ShelterListPage() {
  const { shelters, loading, error, reload, removeShelter } = useShelterList();
  const location = useLocation();
  const [feedback, setFeedback] = useState(() =>
    location.state?.message ? { type: 'success', message: location.state.message } : null,
  );
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (shelter) => {
    if (!window.confirm(`¿Eliminar ${shelter.name}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setFeedback(null);
    setDeletingId(shelter.id);
    try {
      await deleteShelter(shelter.id);
      removeShelter(shelter.id);
      setFeedback({ type: 'success', message: `Refugio ${shelter.name} eliminado correctamente.` });
    } catch (deleteError) {
      if (isNotFound(deleteError)) removeShelter(shelter.id);
      setFeedback({ type: 'error', message: getDeleteErrorMessage(deleteError, shelter) });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Refugios</h1>
          <p className="page-subtitle">Registra y administra los refugios aliados.</p>
        </div>
        <Link to="/refugios/nuevo" className="btn-brand">
          + Registrar refugio
        </Link>
      </div>

      {feedback && <AlertMessage variant={feedback.type}>{feedback.message}</AlertMessage>}

      {loading && <Loader label="Cargando refugios..." />}

      {!loading && error && (
        <>
          <AlertMessage>{error}</AlertMessage>
          <button type="button" className="btn-outline-brand" onClick={reload}>
            Reintentar
          </button>
        </>
      )}

      {!loading && !error && shelters.length === 0 && (
        <p className="empty-state">Aún no hay refugios registrados.</p>
      )}

      {!loading && !error && shelters.length > 0 && (
        <ShelterTable shelters={shelters} onDelete={handleDelete} deletingId={deletingId} />
      )}
    </section>
  );
}