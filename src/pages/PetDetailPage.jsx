import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import usePet from '../hooks/usePet';
import { displayValue, formatAge } from '../utils/formatters';

export default function PetDetailPage() {
  const { id } = useParams();
  const { pet, loading, error, notFound } = usePet(id);

  const fields = pet
    ? [
        ['Especie', pet.species],
        ['Raza', pet.breed],
        ['Edad', formatAge(pet.age)],
        ['Sexo', pet.sex],
        ['Tamaño', pet.size],
        ['Temperamento', pet.temperament],
        ['Necesidades especiales', pet.specialNeeds],
        ['Refugio', pet.shelter?.name],
      ]
    : [];

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/mascotas">Mascotas</Link> / Detalle
      </nav>

      {loading && <Loader label="Cargando mascota..." />}

      {!loading && error && (
        <AlertMessage>{notFound ? 'Mascota no encontrada.' : error}</AlertMessage>
      )}

      {pet && (
        <>
          <div className="page-header">
            <h1 className="page-title">{pet.name}</h1>
            <StatusBadge available={pet.available} />
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
        </>
      )}

      <div className="detail-actions">
        <Link to="/mascotas" className="btn-outline-brand">
          Volver al listado
        </Link>
        {pet && (
          <Link to={`/mascotas/${pet.id}/editar`} className="btn-brand">
            Editar
          </Link>
        )}
      </div>
    </section>
  );
}