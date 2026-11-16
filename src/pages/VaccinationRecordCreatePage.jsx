import { useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import VaccinationRecordBreadcrumb from '../components/VaccinationRecordBreadcrumb';
import VaccinationRecordForm from '../components/VaccinationRecordForm';
import usePet from '../hooks/usePet';
import {
  buildVaccinationRecordPayload,
  EMPTY_VACCINATION_RECORD_FORM,
} from '../services/vaccinationRecordMapper';
import { createVaccinationRecord } from '../services/vaccinationRecordService';
import { PET_NOT_FOUND_MESSAGE } from '../utils/vaccinationRecordMessages';

export default function VaccinationRecordCreatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pet, loading, error, notFound } = usePet(id);

  const handleSubmit = async (values) => {
    await createVaccinationRecord(pet.id, buildVaccinationRecordPayload(values));
    await navigate(`/mascotas/${pet.id}/carnet`, {
      state: { message: 'Carnet registrado correctamente.' },
    });
  };

  return (
    <section className="narrow-page">
      <VaccinationRecordBreadcrumb pet={pet} current="Registrar" />

      <div className="page-header">
        <div>
          <h1 className="page-title">Registrar carnet</h1>
          <p className="page-subtitle">
            Cada mascota tiene un solo carnet. Las vacunas aplicadas son obligatorias.
          </p>
        </div>
      </div>

      {loading && <Loader label="Cargando mascota..." />}
      {!loading && error && <AlertMessage>{notFound ? PET_NOT_FOUND_MESSAGE : error}</AlertMessage>}
      {pet && (
        <VaccinationRecordForm
          pet={pet}
          initialValues={EMPTY_VACCINATION_RECORD_FORM}
          submitLabel="Guardar carnet"
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}