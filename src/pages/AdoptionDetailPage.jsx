import { Link, useParams } from 'react-router-dom';
import AdoptionStatusBadge from '../components/AdoptionStatusBadge';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import useAdoption from '../hooks/useAdoption';
import { formatAdoptionDate } from '../utils/adoptionFormatters';
import { ADOPTION_NOT_FOUND_MESSAGE, getAdoptionPetName } from '../utils/adoptionMessages';
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
  const { adoption, loading, error, notFound } = useAdoption(id);

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/adopciones">Adopciones</Link> / Detalle
      </nav>

      {loading && <Loader label="Cargando adopción..." />}

      {!loading && error && (
        <AlertMessage>{notFound ? ADOPTION_NOT_FOUND_MESSAGE : error}</AlertMessage>
      )}

      {adoption && (
        <>
          <div className="page-header">
            <h1 className="page-title">Adopción de {getAdoptionPetName(adoption)}</h1>
            <AdoptionStatusBadge status={adoption.status} />
          </div>
          <div className="detail-card">
            <dl className="detail-list">
              {getDetailFields(adoption).map(([label, value]) => (
                <div key={label} className="detail-list__item">
                  <dt>{label}</dt>
                  <dd>{displayValue(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </>
      )}

      <div className="detail-actions">
        <Link to="/adopciones" className="btn-outline-brand">
          Volver al listado
        </Link>
      </div>
    </section>
  );
}
