import { Link, useLocation, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import VaccinationRecordCard from '../components/VaccinationRecordCard';
import usePet from '../hooks/usePet';
import useVaccinationRecord from '../hooks/useVaccinationRecord';
import {
  PET_NOT_FOUND_MESSAGE,
  VACCINATION_RECORD_NOT_FOUND_MESSAGE,
} from '../utils/vaccinationRecordMessages';

function MissingRecord({ pet }) {
  return (
    <>
      <AlertMessage>{VACCINATION_RECORD_NOT_FOUND_MESSAGE}</AlertMessage>
      <Link to={`/mascotas/${pet.id}/carnet/nuevo`} className="btn-brand">
        Registrar carnet
      </Link>
    </>
  );
}

function RecordView({ pet, record, error, notFound, message }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Carnet de vacunación</h1>
          <p className="page-subtitle">
            Consulta las vacunas aplicadas a {pet.name} y su próxima fecha de refuerzo.
          </p>
        </div>
        {record && (
          <Link to={`/mascotas/${pet.id}/carnet/editar`} className="btn-outline-brand">
            Editar carnet
          </Link>
        )}
      </div>

      {message && <AlertMessage variant="success">{message}</AlertMessage>}
      {record && <VaccinationRecordCard pet={pet} record={record} />}
      {!record && notFound && <MissingRecord pet={pet} />}
      {!record && !notFound && error && <AlertMessage>{error}</AlertMessage>}
    </>
  );
}

export default function VaccinationRecordPage() {
  const { id } = useParams();
  const location = useLocation();
  const petState = usePet(id);
  const recordState = useVaccinationRecord(id);
  const { pet } = petState;
  const loading = petState.loading || recordState.loading;

  return (
    <section>
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/mascotas">Mascotas</Link>
        {pet && (
          <>
            {' / '}
            <Link to={`/mascotas/${pet.id}`}>{pet.name}</Link>
          </>
        )}
        {' / Carnet de vacunación'}
      </nav>

      {loading && <Loader label="Cargando carnet..." />}

      {!loading && petState.error && (
        <AlertMessage>{petState.notFound ? PET_NOT_FOUND_MESSAGE : petState.error}</AlertMessage>
      )}

      {!loading && pet && (
        <RecordView
          pet={pet}
          record={recordState.record}
          error={recordState.error}
          notFound={recordState.notFound}
          message={location.state?.message}
        />
      )}
    </section>
  );
}