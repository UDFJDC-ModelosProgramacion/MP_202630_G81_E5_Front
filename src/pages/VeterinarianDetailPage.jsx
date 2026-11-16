import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import VeterinarianEventList from '../components/VeterinarianEventList';
import useVeterinarian from '../hooks/useVeterinarian';
import { displayValue } from '../utils/formatters';
import { VETERINARIAN_NOT_FOUND_MESSAGE } from '../utils/veterinarianMessages';

export default function VeterinarianDetailPage() {
  const { id } = useParams();
  const { veterinarian, loading, error, notFound } = useVeterinarian(id);

  const fields = veterinarian
    ? [
        ['Correo', veterinarian.email],
        ['Teléfono', veterinarian.phone],
        ['Especialidad', veterinarian.specialty],
        ['Disponibilidad', veterinarian.availability],
        ['Refugio', veterinarian.shelter?.name],
      ]
    : [];

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/veterinarios">Veterinarios</Link> / Detalle
      </nav>

      {loading && <Loader label="Cargando veterinario..." />}

      {!loading && error && (
        <AlertMessage>{notFound ? VETERINARIAN_NOT_FOUND_MESSAGE : error}</AlertMessage>
      )}

      {veterinarian && (
        <>
          <div className="page-header">
            <h1 className="page-title">{veterinarian.name}</h1>
          </div>
          <div className="detail-card">
            <dl className="detail-list">
              {fields.map(([label, value]) => (
                <div key={label} className="detail-list__item">
                  <dt>{label}</dt>
                  <dd>{displayValue(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <VeterinarianEventList events={veterinarian.registeredEvents ?? []} />
        </>
      )}

      <div className="detail-actions">
        <Link to="/veterinarios" className="btn-outline-brand">
          Volver al listado
        </Link>
        {veterinarian && (
          <Link to={`/veterinarios/${veterinarian.id}/editar`} className="btn-brand">
            Editar
          </Link>
        )}
      </div>
    </section>
  );
}