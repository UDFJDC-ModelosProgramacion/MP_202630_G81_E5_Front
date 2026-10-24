import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdoptionFilters from '../components/AdoptionFilters';
import AdoptionTable from '../components/AdoptionTable';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import useAdoptions from '../hooks/useAdoptions';
import { filterAdoptions } from '../utils/adoptionFilters';

export default function AdoptionListPage() {
  const { adoptions, loading, error, reload } = useAdoptions();
  const location = useLocation();
  const successMessage = location.state?.message;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const visibleAdoptions = filterAdoptions(adoptions, search, status);
  const hasAdoptions = !loading && !error && adoptions.length > 0;

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Adopciones</h1>
          <p className="page-subtitle">
            Haz seguimiento a cada proceso, desde la solicitud hasta la entrega.
          </p>
        </div>
        <Link to="/adopciones/nueva" className="btn-brand">
          + Registrar adopción
        </Link>
      </div>

      {successMessage && <AlertMessage variant="success">{successMessage}</AlertMessage>}

      {loading && <Loader label="Cargando adopciones..." />}

      {!loading && error && (
        <>
          <AlertMessage>{error}</AlertMessage>
          <button type="button" className="btn-outline-brand" onClick={reload}>
            Reintentar
          </button>
        </>
      )}

      {!loading && !error && adoptions.length === 0 && (
        <p className="empty-state">Aún no hay adopciones registradas.</p>
      )}

      {hasAdoptions && (
        <>
          <AdoptionFilters
            search={search}
            status={status}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
          />
          {visibleAdoptions.length === 0 ? (
            <p className="empty-state">No hay adopciones que coincidan con tu búsqueda.</p>
          ) : (
            <AdoptionTable adoptions={visibleAdoptions} />
          )}
        </>
      )}
    </section>
  );
}
