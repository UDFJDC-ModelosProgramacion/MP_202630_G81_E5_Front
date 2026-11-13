import { Link, useLocation, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import VaccinationRecordBreadcrumb from '../components/VaccinationRecordBreadcrumb';
import VaccinationRecordCard from '../components/VaccinationRecordCard';
import VaccinationRecordMissing from '../components/VaccinationRecordMissing';
import usePet from '../hooks/usePet';
import useVaccinationRecord from '../hooks/useVaccinationRecord';
import useVaccinationRecordDelete from '../hooks/useVaccinationRecordDelete';
import { PET_NOT_FOUND_MESSAGE } from '../utils/vaccinationRecordMessages';

function RecordView({ pet, recordState, feedback, deleting, onDelete }) {
  const { record, error, notFound } = recordState;

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

      {feedback && <AlertMessage variant={feedback.type}>{feedback.message}</AlertMessage>}
      {record && (
        <VaccinationRecordCard
          pet={pet}
          record={record}
          onDelete={onDelete}
          deleting={deleting}
        />
      )}
      {!record && notFound && <VaccinationRecordMissing pet={pet} showAlert={!feedback} />}
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
  const { deleting, feedback: deleteFeedback, remove } = useVaccinationRecordDelete(
    pet,
    recordState.clearRecord,
  );
  const loading = petState.loading || recordState.loading;
  const routeMessage = location.state?.message;
  const feedback =
    deleteFeedback ?? (routeMessage ? { type: 'success', message: routeMessage } : null);

  return (
    <section>
      <VaccinationRecordBreadcrumb pet={pet} />

      {loading && <Loader label="Cargando carnet..." />}

      {!loading && petState.error && (
        <AlertMessage>{petState.notFound ? PET_NOT_FOUND_MESSAGE : petState.error}</AlertMessage>
      )}

      {!loading && pet && (
        <RecordView
          pet={pet}
          recordState={recordState}
          feedback={feedback}
          deleting={deleting}
          onDelete={remove}
        />
      )}
    </section>
  );
}