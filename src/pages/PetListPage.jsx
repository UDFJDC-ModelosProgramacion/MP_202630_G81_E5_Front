import { Link } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import PetTable from '../components/PetTable';
import usePets from '../hooks/usePets';

export default function PetListPage() {
  const { pets, loading, error, reload } = usePets();

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

      {!loading && !error && pets.length > 0 && <PetTable pets={pets} />}
    </section>
  );
}