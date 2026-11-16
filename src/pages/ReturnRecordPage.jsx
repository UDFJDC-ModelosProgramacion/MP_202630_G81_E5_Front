import { Link, useParams } from 'react-router-dom';
import AdoptionStatusBadge from '../components/AdoptionStatusBadge';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import ReturnAdoptionSummary from '../components/ReturnAdoptionSummary';
import ReturnRecordPanel from '../components/ReturnRecordPanel';
import useAdoption from '../hooks/useAdoption';
import useReturnRecord from '../hooks/useReturnRecord';
import useReturnRecordActions from '../hooks/useReturnRecordActions';
import { ADOPTION_NOT_FOUND_MESSAGE, getAdoptionPetName } from '../utils/adoptionMessages';

export default function ReturnRecordPage() {
  const { id } = useParams();
  const adoptionState = useAdoption(id);
  const recordState = useReturnRecord(id);
  const { adoption, setAdoption } = adoptionState;
  const { returnRecord, setReturnRecord } = recordState;
  const actions = useReturnRecordActions({ adoption, setAdoption, setReturnRecord });
  const loading = adoptionState.loading || recordState.loading;
  const ready = !loading && adoption;
  const petName = adoption ? getAdoptionPetName(adoption) : '';

  return (
    <section>
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/adopciones">Adopciones</Link>
        {adoption && ` / ${petName}`}
      </nav>

      {loading && <Loader label="Cargando devolución..." />}

      {!loading && adoptionState.error && (
        <AlertMessage>
          {adoptionState.notFound ? ADOPTION_NOT_FOUND_MESSAGE : adoptionState.error}
        </AlertMessage>
      )}

      {ready && recordState.error && <AlertMessage>{recordState.error}</AlertMessage>}
      {ready && actions.message && <AlertMessage variant="success">{actions.message}</AlertMessage>}
      {ready && actions.actionError && <AlertMessage>{actions.actionError}</AlertMessage>}

      {ready && (
        <>
          <div className="page-header return-header">
            <h1 className="page-title">Adopción de {petName}</h1>
            <AdoptionStatusBadge status={adoption.status} />
          </div>
          <div className="return-layout">
            <ReturnAdoptionSummary adoption={adoption} hasReturnRecord={Boolean(returnRecord)} />
            {!recordState.error && (
              <ReturnRecordPanel
                adoptionId={adoption.id}
                returnRecord={returnRecord}
                actions={actions}
              />
            )}
          </div>
        </>
      )}

      <div className="detail-actions">
        <Link to={`/adopciones/${id}`} className="btn-outline-brand">
          Volver a la adopción
        </Link>
      </div>
    </section>
  );
}
