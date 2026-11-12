import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import PetTable from '../components/PetTable';
import usePets from '../hooks/usePets';
import { isNotFound } from '../services/apiError';
import { deletePet } from '../services/petService';
import { getDeleteErrorMessage } from '../utils/petMessages';

export default function PetListPage() {
  const { pets, loading, error, reload, removePet } = usePets();
  const location = useLocation();
  const [feedback, setFeedback] = useState(() =>
    location.state?.message ? { type: 'success', message: location.state.message } : null,
  );
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (pet) => {
    if (!window.confirm(`¿Eliminar a ${pet.name}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setFeedback(null);
    setDeletingId(pet.id);
    try {
      await deletePet(pet.id);
      removePet(pet.id);
      setFeedback({ type: 'success', message: `Mascota ${pet.name} eliminada correctamente.` });
    } catch (deleteError) {
      if (isNotFound(deleteError)) removePet(pet.id);
      setFeedback({ type: 'error', message: getDeleteErrorMessage(deleteError, pet) });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mascotas</h1>
          <p className="page-subtitle">
            Registra y administra las mascotas disponibles para adopción.
          </p>
        </div>
        <Link to="/mascotas/nueva" className="btn-brand">
          + Registrar mascota
        </Link>
      </div>

      {feedback && <AlertMessage variant={feedback.type}>{feedback.message}</AlertMessage>}

      {loading && <Loader label="Cargando mascotas..." />}

      {!loading && error && (
        <>
          <AlertMessage>{error}</AlertMessage>
          <button type="button" className="btn-outline-brand" onClick={reload}>
            Reintentar
          </button>
        </>
      )}

      {!loading && !error && pets.length === 0 && (
        <p className="empty-state">Aún no hay mascotas registradas.</p>
      )}

      {!loading && !error && pets.length > 0 && (
        <PetTable pets={pets} onDelete={handleDelete} deletingId={deletingId} />
      )}
    </section>
  );
}