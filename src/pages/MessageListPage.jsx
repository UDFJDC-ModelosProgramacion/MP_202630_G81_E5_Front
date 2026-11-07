import { useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import MessageCard from '../components/MessageCard';
import MessagePanel from '../components/MessagePanel';
import useMessageActions from '../hooks/useMessageActions';
import useMessages from '../hooks/useMessages';

export default function MessageListPage() {
  const { adopterId } = useParams();
  const { messages, loading, error, reload, refresh, setMessages } = useMessages(adopterId);
  const actions = useMessageActions(adopterId, setMessages, refresh);
  const loaded = !loading && !error;

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis mensajes</h1>
          <p className="page-subtitle">Mensajes que has enviado desde tu perfil de adoptante.</p>
        </div>
      </div>

      {actions.message && <AlertMessage variant="success">{actions.message}</AlertMessage>}
      {actions.actionError && <AlertMessage>{actions.actionError}</AlertMessage>}

      {loading && <Loader label="Cargando mensajes..." />}

      {!loading && error && (
        <>
          <AlertMessage>{error}</AlertMessage>
          <button type="button" className="btn-outline-brand" onClick={reload}>
            Reintentar
          </button>
        </>
      )}

      {loaded && (
        <div className="message-layout">
          <div>
            {messages.length === 0 ? (
              <p className="empty-state">Aún no has enviado ningún mensaje.</p>
            ) : (
              <ul className="message-list" aria-label="Mis mensajes">
                {messages.map((item) => (
                  <li key={item.id}>
                    <MessageCard
                      message={item}
                      adopterId={adopterId}
                      editing={actions.editing?.id === item.id}
                      deleting={actions.deletingId === item.id}
                      onEdit={() => actions.startEdit(item)}
                      onDelete={() => actions.remove(item)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <MessagePanel
            editing={actions.editing}
            formKey={actions.formKey}
            onSubmit={actions.save}
            onCancel={actions.cancelEdit}
          />
        </div>
      )}
    </section>
  );
}