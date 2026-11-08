import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import VideoPlayer from '../components/VideoPlayer';
import useVideo from '../hooks/useVideo';
import { displayValue } from '../utils/formatters';
import { isHttpUrl } from '../utils/videoUrl';

export default function VideoDetailPage() {
  const { id, videoId } = useParams();
  const { video, loading, error } = useVideo(id, videoId);
  const listPath = `/refugios/${id}/videos`;

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to={listPath}>Videos del refugio</Link> / Detalle
      </nav>

      {loading && <Loader label="Cargando video..." />}

      {!loading && error && <AlertMessage>{error}</AlertMessage>}

      {video && (
        <>
          <div className="page-header">
            <h1 className="page-title">Detalle del video</h1>
          </div>
          <div className="detail-card">
            <dl className="detail-list">
              <div className="detail-list__item">
                <dt>URL</dt>
                <dd className="video-detail__url">{displayValue(video.url)}</dd>
              </div>
              <div className="detail-list__item">
                <dt>Refugio</dt>
                <dd>{displayValue(video.shelter?.name)}</dd>
              </div>
            </dl>
            <VideoPlayer url={video.url} />
          </div>
        </>
      )}

      <div className="detail-actions">
        <Link to={listPath} className="btn-outline-brand">
          Volver a los videos
        </Link>
        {video && isHttpUrl(video.url) && (
          <a href={video.url} className="btn-brand" target="_blank" rel="noopener noreferrer">
            Abrir video
          </a>
        )}
      </div>
    </section>
  );
}