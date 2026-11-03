import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import useShelter from '../hooks/useShelter';
import { displayValue } from '../utils/formatters';

export default function ShelterDetailPage() {
  const { id } = useParams();
  const { shelter, loading, error, notFound } = useShelter(id);

  const fields = shelter
    ? [
        ['Ciudad', shelter.city],
        ['Eventos programados', shelter.shelterEvents?.length ?? 0],
      ]
    : [];

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/refugios">Refugios</Link> / Detalle
      </nav>

      {loading && <Loader label="Cargando refugio..." />}

      {!loading && error && (
        <AlertMessage>{notFound ? 'Refugio no encontrado.' : error}</AlertMessage>
      )}

      {shelter && (
        <>
          <div className="page-header">
            <h1 className="page-title">{shelter.name}</h1>
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
        <Link to="/refugios" className="btn-outline-brand">
          Volver al listado
        </Link>
        {shelter && (
          <Link to={`/refugios/${shelter.id}/fotos`} className="btn-outline-brand">
            Fotos
          </Link>
        )}
        {shelter && (
          <Link to={`/refugios/${shelter.id}/editar`} className="btn-brand">
            Editar
          </Link>
        )}
      </div>
    </section>
  );
}