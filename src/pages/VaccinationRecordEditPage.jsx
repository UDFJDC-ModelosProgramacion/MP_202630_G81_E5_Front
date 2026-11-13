import { useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import VaccinationRecordBreadcrumb from '../components/VaccinationRecordBreadcrumb';
import VaccinationRecordForm from '../components/VaccinationRecordForm';
import VaccinationRecordMissing from '../components/VaccinationRecordMissing';
import usePet from '../hooks/usePet';
import useVaccinationRecord from '../hooks/useVaccinationRecord';
import {
  buildVaccinationRecordPayload,
  vaccinationRecordToFormValues,
} from '../services/vaccinationRecordMapper';
import { updateVaccinationRecord } from '../services/vaccinationRecordService';
import { PET_NOT_FOUND_MESSAGE } from '../utils/vaccinationRecordMessages';

export default function VaccinationRecordEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const petState = usePet(id);
  const recordState = useVaccinationRecord(id);
  const { pet } = petState;
  const { record } = recordState;
  const loading = petState.loading || recordState.loading;

  const handleSubmit = async (values) => {
    await updateVaccinationRecord(pet.id, buildVaccinationRecordPayload(values, record));
    await navigate(`/mascotas/${pet.id}/carnet`, {
      state: { message: 'Cambios guardados correctamente.' },
    });
  };

  return (
    <section className="narrow-page">
      <VaccinationRecordBreadcrumb pet={pet} current="Editar" />

      <div className="page-header">
        <div>
          <h1 className="page-title">Editar carnet</h1>
          <p className="page-subtitle">
            Actualiza las vacunas aplicadas y la próxima fecha de vacunación.
          </p>
        </div>
      </div>

      {loading && <Loader label="Cargando carnet..." />}

      {!loading && petState.error && (
        <AlertMessage>{petState.notFound ? PET_NOT_FOUND_MESSAGE : petState.error}</AlertMessage>
      )}
      {!loading && pet && recordState.notFound && <VaccinationRecordMissing pet={pet} />}
      {!loading && pet && !recordState.notFound && recordState.error && (
        <AlertMessage>{recordState.error}</AlertMessage>
      )}
      {!loading && pet && record && (
        <VaccinationRecordForm
          pet={pet}
          initialValues={vaccinationRecordToFormValues(record)}
          submitLabel="Guardar cambios"
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}