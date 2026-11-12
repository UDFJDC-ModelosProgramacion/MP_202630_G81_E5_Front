import { Link, useLocation } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import VeterinarianTable from '../components/VeterinarianTable';
import useVeterinarians from '../hooks/useVeterinarians';

export default function VeterinarianListPage() {
  const { veterinarians, loading, error, reload } = useVeterinarians();
  const location = useLocation();
  const successMessage = location.state?.message;

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Veterinarios</h1>
          <p className="page-subtitle">Gestiona el equipo veterinario de los refugios.</p>
        </div>
        <Link to="/veterinarios/nuevo" className="btn-brand">
          + Registrar veterinario
        </Link>
      </div>

      {successMessage && <AlertMessage variant="success">{successMessage}</AlertMessage>}

      {loading && <Loader label="Cargando veterinarios..." />}

      {!loading && error && (
        <>
          <AlertMessage>{error}</AlertMessage>
          <button type="button" className="btn-outline-brand" onClick={reload}>
            Reintentar
          </button>
        </>
      )}

      {!loading && !error && veterinarians.length === 0 && (
        <p className="empty-state">Aún no hay veterinarios registrados.</p>
      )}

      {!loading && !error && veterinarians.length > 0 && (
        <VeterinarianTable veterinarians={veterinarians} />
      )}
    </section>
  );
}