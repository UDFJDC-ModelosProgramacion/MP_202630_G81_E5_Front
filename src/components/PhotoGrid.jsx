import { Link } from 'react-router-dom';
import PhotoImage from './PhotoImage';

export default function PhotoGrid({
  photos,
  ownerName,
  basePath,
  onEdit,
  onDelete,
  deletingId = null,
}) {
  return (
    <ul className="photo-grid">
      {photos.map((photo, index) => {
        const label = `Foto ${index + 1}`;
        return (
          <li key={photo.id} className="photo-grid__item">
            <Link
              to={`${basePath}/${photo.id}`}
              className="photo-grid__link"
              aria-label={`Ver ${label}`}
            >
              <PhotoImage
                key={photo.url}
                url={photo.url}
                label={label}
                alt={`${label} de ${ownerName}`}
              />
            </Link>
            {(onEdit || onDelete) && (
              <div className="photo-grid__actions">
                {onEdit && (
                  <button
                    type="button"
                    className="photo-grid__action"
                    aria-label={`Editar ${label}`}
                    onClick={() => onEdit(photo)}
                  >
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    className="photo-grid__action photo-grid__action--danger"
                    aria-label={`Eliminar ${label}`}
                    disabled={deletingId === photo.id}
                    onClick={() => onDelete(photo, label)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}