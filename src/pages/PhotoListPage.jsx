import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import PhotoWorkspace from '../components/PhotoWorkspace';
import usePhotoActions from '../hooks/usePhotoActions';
import usePhotoCollection from '../hooks/usePhotoCollection';
import { PHOTO_OWNER_INFO } from '../utils/photoOwners';

function PhotoListContent({ owner, id }) {
  const { entity, photos, loading, error, notFound, reload, addPhoto, replacePhoto } =
    usePhotoCollection(owner, id);
  const actions = usePhotoActions({ owner, entity, addPhoto, replacePhoto });
  const info = PHOTO_OWNER_INFO[owner];

  return (
    <section>
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to={info.basePath}>{info.section}</Link>
        {entity && <> / {entity.name}</>} / Fotos
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Fotos</h1>
          {entity && (
            <p className="page-subtitle">Muestra cómo luce {entity.name} a los adoptantes.</p>
          )}
        </div>
      </div>

      {actions.feedback && (
        <AlertMessage variant={actions.feedback.type}>{actions.feedback.message}</AlertMessage>
      )}

      {loading && <Loader label="Cargando fotos..." />}

      {!loading && error && (
        <>
          <AlertMessage>{error}</AlertMessage>
          {!notFound && (
            <button type="button" className="btn-outline-brand" onClick={reload}>
              Reintentar
            </button>
          )}
        </>
      )}

      {!loading && !error && entity && (
        <PhotoWorkspace
          owner={owner}
          entity={entity}
          photos={photos}
          editing={actions.editing}
          formKey={actions.formKey}
          onEdit={actions.startEdit}
          onCancel={actions.cancelEdit}
          onSubmit={actions.submitPhoto}
        />
      )}
    </section>
  );
}

export default function PhotoListPage({ owner }) {
  const { id } = useParams();
  return <PhotoListContent key={`${owner}:${id}`} owner={owner} id={id} />;
}