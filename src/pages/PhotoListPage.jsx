import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import PhotoGrid from '../components/PhotoGrid';
import PhotoTabs from '../components/PhotoTabs';
import usePhotoCollection from '../hooks/usePhotoCollection';
import { PHOTO_OWNER_INFO, photosPath } from '../utils/photoOwners';

export default function PhotoListPage({ owner }) {
  const { id } = useParams();
  const { entity, photos, loading, error, notFound, reload } = usePhotoCollection(owner, id);
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
        <>
          <PhotoTabs owner={owner} entity={entity} />
          <div className="photo-card">
            <h2 className="photo-card__title">Fotos de {entity.name}</h2>
            {photos.length === 0 ? (
              <p className="empty-state">Aún no hay fotos de {entity.name}.</p>
            ) : (
              <PhotoGrid
                photos={photos}
                ownerName={entity.name}
                basePath={photosPath(owner, id)}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}