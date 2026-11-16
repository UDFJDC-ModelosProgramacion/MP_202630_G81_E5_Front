import MessageForm from './MessageForm';
import { messageToFormValues, EMPTY_MESSAGE_FORM } from '../services/messageMapper';

export default function MessagePanel({ editing, formKey, onSubmit, onCancel }) {
  return (
    <aside aria-labelledby="message-panel-title">
      <h2 id="message-panel-title" className="message-panel__title">
        {editing ? 'Editar mensaje' : 'Nuevo mensaje'}
      </h2>
      <MessageForm
        key={formKey}
        initialValues={editing ? messageToFormValues(editing) : EMPTY_MESSAGE_FORM}
        submitLabel={editing ? 'Guardar cambios' : 'Enviar mensaje'}
        focusOnMount={Boolean(editing)}
        onSubmit={onSubmit}
        onCancel={editing ? onCancel : undefined}
      />
    </aside>
  );
}