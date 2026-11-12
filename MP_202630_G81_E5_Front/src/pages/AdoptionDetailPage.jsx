import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdoptionStatusBadge from '../components/AdoptionStatusBadge';
import AdoptionStatusForm from '../components/AdoptionStatusForm';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import useAdoption from '../hooks/useAdoption';
import { isNotFound } from '../services/apiError';
import { buildStatusPayload } from '../services/adoptionMapper';
import { deleteAdoption, updateAdoption } from '../services/adoptionService';
import { formatAdoptionDate } from '../utils/adoptionFormatters';
import {
  ADOPTION_NOT_FOUND_MESSAGE,
  getAdoptionPetName,
  getDeleteErrorMessage,
} from '../utils/adoptionMessages';
import { displayValue, formatPetType } from '../utils/formatters';

function getDetailFields(adoption) {
  const { pet, adopter, responsibleVeterinarian: veterinarian } = adoption;

  return [
    ['Mascota', pet?.name],
    ['Especie y raza', pet ? formatPetType(pet) : null],
    ['Adoptante', adopter?.name],
    ['Correo del adoptante', adopter?.email],
    ['Teléfono del adoptante', adopter?.phone],
    ['Dirección del adoptante', adopter?.address],
    ['Veterinario responsable', veterinarian?.name],
    ['Especialidad', veterinarian?.specialty],
    ['Correo del veterinario', veterinarian?.email],
    ['Fecha de adopción', formatAdoptionDate(adoption.date)],
  ];
}

export default function AdoptionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adoption, loading, error, notFound, setAdoption } = useAdoption(id);
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [removed, setRemoved] = useState(false);

  const visibleAdoption = removed ? null : adoption;

  const handleSaveStatus = async (status) => {
    const saved = await updateAdoption(adoption.id, buildStatusPayload(adoption, status));
    setAdoption({ ...adoption, status: saved?.status ?? status });
  };

  const handleDelete = async () => {
    const petName = getAdoptionPetName(adoption);
    if (!window.confirm(`¿Eliminar la adopción de ${petName}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteAdoption(adoption.id);
      await navigate('/adopciones', {
        state: { message: `Adopción de ${petName} eliminada correctamente.` },
      });
    } catch (failure) {
      if (isNotFound(failure)) setRemoved(true);
      setDeleteError(getDeleteErrorMessage(failure, adoption));
      setDeleting(false);
    }
  };

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/adopciones">Adopciones</Link> / Detalle
      </nav>

      {loading && <Loader label="Cargando adopción..." />}

      {!loading && error && (
        <AlertMessage>{notFound ? ADOPTION_NOT_FOUND_MESSAGE : error}</AlertMessage>
      )}

      {deleteError && <AlertMessage>{deleteError}</AlertMessage>}

      {visibleAdoption && (
        <>
          <div className="page-header">
            <h1 className="page-title">Adopción de {getAdoptionPetName(visibleAdoption)}</h1>
            <AdoptionStatusBadge status={visibleAdoption.status} />
          </div>
          <div className="detail-card">
            <dl className="detail-list">
              {getDetailFields(visibleAdoption).map(([label, value]) => (
                <div key={label} className="detail-list__item">
                  <dt>{label}</dt>
                  <dd>{displayValue(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="detail-card adoption-actions">
            <h2 className="adoption-actions__title">Seguimiento</h2>
            <AdoptionStatusForm currentStatus={visibleAdoption.status} onSave={handleSaveStatus} />
          </div>
        </>
      )}

      <div className="detail-actions">
        <Link to="/adopciones" className="btn-outline-brand">
          Volver al listado
        </Link>
        {visibleAdoption && (
          <button
            type="button"
            className="btn-outline-brand adoption-btn-danger"
            aria-label={`Eliminar la adopción de ${getAdoptionPetName(visibleAdoption)}`}
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? 'Eliminando...' : 'Eliminar adopción'}
          </button>
        )}
      </div>
    </section>
  );
}
