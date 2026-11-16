import { Link } from 'react-router-dom';
import { formatVideoCount } from '../utils/videoMessages';

export default function VideoList({
  videos,
  shelterId,
  editingId = null,
  deletingId = null,
  onEdit,
  onDelete,
}) {
  return (
    <section className="video-card" aria-labelledby="video-list-title">
      <h2 id="video-list-title" className="video-card__title">
        Videos publicados
      </h2>

      {videos.length === 0 ? (
        <p className="empty-state">Este refugio aún no tiene videos.</p>
      ) : (
        <>
          <ul className="video-list" aria-label="Videos del refugio">
            {videos.map((video) => (
              <li
                key={video.id}
                className={`video-list__item${editingId === video.id ? ' video-list__item--editing' : ''}`}
              >
                <div className="video-list__thumb" aria-hidden="true">
                  Video
                </div>
                <Link to={`/refugios/${shelterId}/videos/${video.id}`} className="video-list__url">
                  {video.url}
                </Link>
                {(onEdit || onDelete) && (
                  <div className="video-list__actions">
                    {onEdit && (
                      <button
                        type="button"
                        className="video-list__button"
                        aria-label={`Editar el video ${video.id}`}
                        disabled={deletingId === video.id}
                        onClick={() => onEdit(video)}
                      >
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className="video-list__button video-list__button--danger"
                        aria-label={`Eliminar el video ${video.id}`}
                        disabled={deletingId === video.id}
                        onClick={() => onDelete(video)}
                      >
                        {deletingId === video.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <p className="video-card__footer">{formatVideoCount(videos.length)}</p>
        </>
      )}
    </section>
  );
}