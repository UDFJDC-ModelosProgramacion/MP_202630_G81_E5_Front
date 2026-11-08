import { Link, useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import VideoList from '../components/VideoList';
import VideoPanel from '../components/VideoPanel';
import useShelter from '../hooks/useShelter';
import useVideoActions from '../hooks/useVideoActions';
import useVideoShelters from '../hooks/useVideoShelters';
import useVideos from '../hooks/useVideos';
import { buildShelterOptions } from '../services/videoMapper';

export default function ShelterVideosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { shelter } = useShelter(id);
  const shelters = useVideoShelters();
  const { videos, loading, error, reload, setVideos } = useVideos(id);
  const actions = useVideoActions(id, setVideos);
  const loaded = !loading && !error;
  const shelterOptions = buildShelterOptions(shelters, id, shelter?.name);

  const changeShelter = async (shelterId) => {
    actions.clearFeedback();
    await navigate(`/refugios/${shelterId}/videos`);
  };

  return (
    <section>
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/refugios">Refugios</Link> /{' '}
        {shelter ? <Link to={`/refugios/${id}`}>{shelter.name}</Link> : 'Refugio'} / Videos
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Videos del refugio</h1>
          <p className="page-subtitle">Ayuda a los adoptantes a reconocer las instalaciones.</p>
        </div>
      </div>

      {actions.message && <AlertMessage variant="success">{actions.message}</AlertMessage>}
      {actions.actionError && <AlertMessage>{actions.actionError}</AlertMessage>}

      {loading && <Loader label="Cargando videos..." />}

      {!loading && error && (
        <>
          <AlertMessage>{error}</AlertMessage>
          <button type="button" className="btn-outline-brand" onClick={reload}>
            Reintentar
          </button>
        </>
      )}

      {loaded && (
        <div className="video-layout">
          <VideoList
            videos={videos}
            shelterId={id}
            editingId={actions.editing?.id ?? null}
            deletingId={actions.deletingId}
            onEdit={actions.startEdit}
            onDelete={actions.remove}
          />
          <VideoPanel
            editing={actions.editing}
            formKey={actions.formKey}
            shelterId={id}
            shelterOptions={shelterOptions}
            onShelterChange={changeShelter}
            onSubmit={actions.save}
            onCancel={actions.cancelEdit}
          />
        </div>
      )}
    </section>
  );
}