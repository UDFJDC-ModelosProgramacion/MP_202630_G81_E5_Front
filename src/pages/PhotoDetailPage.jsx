import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import PhotoImage from '../components/PhotoImage';
import usePhoto from '../hooks/usePhoto';
import { displayValue } from '../utils/formatters';
import { describePhotoOwner, PHOTO_OWNER_INFO, photosPath } from '../utils/photoOwners';

export default function PhotoDetailPage({ owner }) {
  const { id, photoId } = useParams();
  const { entity, photo, loading, error } = usePhoto(owner, id, photoId);
  const info = PHOTO_OWNER_INFO[owner];
  const listPath = photosPath(owner, id);

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to={info.basePath}>{info.section}</Link>
        {entity && <> / {entity.name}</>} / <Link to={listPath}>Fotos</Link> / Detalle
      </nav>

      {loading && <Loader label="Cargando foto..." />}

      {!loading && error && <AlertMessage>{error}</AlertMessage>}

      {photo && (
        <>
          <div className="page-header">
            <h1 className="page-title">Foto</h1>
          </div>
          <div className="detail-card">
            <PhotoImage
              key={photo.url}
              url={photo.url}
              label="Foto"
              alt={`Foto de ${entity.name}`}
              large
            />
            <dl className="detail-list photo-detail__list">
              <div className="detail-list__item">
                <dt>Asociada a</dt>
                <dd>{describePhotoOwner(owner, entity)}</dd>
              </div>
              <div className="detail-list__item photo-detail__wide">
                <dt>URL</dt>
                <dd>{displayValue(photo.url)}</dd>
              </div>
            </dl>
          </div>
        </>
      )}

      <div className="detail-actions">
        <Link to={listPath} className="btn-outline-brand">
          Volver a las fotos
        </Link>
      </div>
    </section>
  );
}