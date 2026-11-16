import { Link, useNavigate, useParams } from 'react-router-dom';
import AdoptionStatusBadge from '../components/AdoptionStatusBadge';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import TrialCohabitationForm from '../components/TrialCohabitationForm';
import TrialCohabitationSummary from '../components/TrialCohabitationSummary';
import useAdoption from '../hooks/useAdoption';
import useTrialCohabitation from '../hooks/useTrialCohabitation';
import {
  EMPTY_TRIAL_COHABITATION_FORM,
  buildTrialCohabitationPayload,
  mapTrialCohabitationToForm,
} from '../services/trialCohabitationMapper';
import { ADOPTION_NOT_FOUND_MESSAGE, getAdoptionPetName } from '../utils/adoptionMessages';
import {
  TRIAL_COHABITATION_ALREADY_EXISTS_MESSAGE,
  TRIAL_COHABITATION_NOT_FOUND_MESSAGE,
  TRIAL_COHABITATION_REGISTERED_MESSAGE,
  TRIAL_COHABITATION_UPDATED_MESSAGE,
} from '../utils/trialCohabitationMessages';

const MODES = {
  create: {
    title: 'Registrar convivencia de prueba',
    submitLabel: 'Registrar convivencia',
    message: TRIAL_COHABITATION_REGISTERED_MESSAGE,
  },
  edit: {
    title: 'Editar convivencia de prueba',
    submitLabel: 'Guardar cambios',
    message: TRIAL_COHABITATION_UPDATED_MESSAGE,
  },
};

function getBlockingMessage(adoptionState, trialState, isEdit) {
  if (adoptionState.error) {
    return adoptionState.notFound ? ADOPTION_NOT_FOUND_MESSAGE : adoptionState.error;
  }
  if (trialState.error && !trialState.notFound) return trialState.error;
  if (isEdit && !trialState.trialCohabitation) return TRIAL_COHABITATION_NOT_FOUND_MESSAGE;
  if (!isEdit && trialState.trialCohabitation) return TRIAL_COHABITATION_ALREADY_EXISTS_MESSAGE;
  return null;
}

export default function TrialCohabitationPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const adoptionState = useAdoption(id);
  const trialState = useTrialCohabitation(id);
  const isEdit = mode === 'edit';
  const config = MODES[mode];
  const { adoption } = adoptionState;
  const { trialCohabitation } = trialState;

  const loading = adoptionState.loading || trialState.loading;
  const blockingMessage = loading ? null : getBlockingMessage(adoptionState, trialState, isEdit);
  const ready = !loading && adoption && !blockingMessage;
  const petName = adoption ? getAdoptionPetName(adoption) : '';
  const backTo = adoption ? `/adopciones/${id}` : '/adopciones';

  const handleSubmit = async (values) => {
    const save = isEdit ? trialState.editTrialCohabitation : trialState.registerTrialCohabitation;
    await save(buildTrialCohabitationPayload(values, trialCohabitation));
    await navigate(`/adopciones/${id}`, { state: { message: config.message } });
  };

  return (
    <section>
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/adopciones">Adopciones</Link>
        {adoption && ` / ${petName}`}
      </nav>

      {loading && <Loader label="Cargando convivencia de prueba..." />}
      {blockingMessage && <AlertMessage>{blockingMessage}</AlertMessage>}

      {ready && (
        <>
          <div className="page-header return-header">
            <h1 className="page-title">Adopción de {petName}</h1>
            <AdoptionStatusBadge status={adoption.status} />
          </div>
          <div className="return-layout">
            <TrialCohabitationSummary adoption={adoption} hasTrialCohabitation={isEdit} />
            <TrialCohabitationForm
              adoptionId={id}
              initialValues={
                isEdit ? mapTrialCohabitationToForm(trialCohabitation) : EMPTY_TRIAL_COHABITATION_FORM
              }
              title={config.title}
              submitLabel={config.submitLabel}
              onSubmit={handleSubmit}
            />
          </div>
        </>
      )}

      {blockingMessage && (
        <div className="detail-actions">
          <Link to={backTo} className="btn-outline-brand">
            {adoption ? 'Volver a la adopción' : 'Volver a adopciones'}
          </Link>
        </div>
      )}
    </section>
  );
}