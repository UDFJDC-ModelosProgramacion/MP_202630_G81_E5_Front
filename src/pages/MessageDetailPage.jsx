import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import useMessage from '../hooks/useMessage';
import { formatAdoptionDate } from '../utils/adoptionFormatters';
import { displayValue } from '../utils/formatters';

export default function MessageDetailPage() {
  const { adopterId, messageId } = useParams();
  const { message, loading, error } = useMessage(adopterId, messageId);
  const listPath = `/adoptantes/${adopterId}/mensajes`;

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to={listPath}>Mis mensajes</Link> / Detalle
      </nav>

      {loading && <Loader label="Cargando mensaje..." />}

      {!loading && error && <AlertMessage>{error}</AlertMessage>}

      {message && (
        <>
          <div className="page-header">
            <h1 className="page-title">Detalle del mensaje</h1>
          </div>
          <div className="detail-card">
            <dl className="detail-list">
              <div className="detail-list__item">
                <dt>Fecha de envío</dt>
                <dd>{formatAdoptionDate(message.sentDate)}</dd>
              </div>
              <div className="detail-list__item">
                <dt>Estado</dt>
                <dd>Enviado</dd>
              </div>
              <div className="detail-list__item message-detail__wide">
                <dt>Mensaje</dt>
                <dd>{displayValue(message.content)}</dd>
              </div>
            </dl>
          </div>
        </>
      )}

      <div className="detail-actions">
        <Link to={listPath} className="btn-outline-brand">
          Volver a mis mensajes
        </Link>
      </div>
    </section>
  );
}