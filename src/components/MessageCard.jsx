import { Link } from 'react-router-dom';
import { formatAdoptionDate } from '../utils/adoptionFormatters';

export default function MessageCard({ message, adopterId, editing, deleting, onEdit, onDelete }) {
  return (
    <article className={`message-card${editing ? ' message-card--editing' : ''}`}>
      <div className="message-card__header">
        <span className="message-card__badge">Enviado</span>
        <span className="message-card__date">{formatAdoptionDate(message.sentDate)}</span>
      </div>
      <p className="message-card__content">{message.content}</p>
      <div className="message-card__actions">
        <Link
          to={`/adoptantes/${adopterId}/mensajes/${message.id}`}
          className="message-card__button"
          aria-label={`Ver detalle del mensaje ${message.id}`}
        >
          Ver detalle
        </Link>
        <button
          type="button"
          className="message-card__button"
          aria-label={`Editar el mensaje ${message.id}`}
          disabled={deleting}
          onClick={onEdit}
        >
          Editar
        </button>
        <button
          type="button"
          className="message-card__button message-card__button--danger"
          aria-label={`Eliminar el mensaje ${message.id}`}
          disabled={deleting}
          onClick={onDelete}
        >
          {deleting ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </article>
  );
}