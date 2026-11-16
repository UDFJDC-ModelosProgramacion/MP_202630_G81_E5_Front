import ShelterEventForm from './ShelterEventForm';
import { EMPTY_EVENT_FORM, eventToFormValues } from '../services/shelterEventMapper';

export default function ShelterEventPanel({ editing, formKey, onSubmit, onCancel }) {
  return (
    <aside aria-labelledby="event-panel-title">
      <h2 id="event-panel-title" className="event-panel__title">
        {editing ? 'Editar evento' : 'Nuevo evento'}
      </h2>
      <ShelterEventForm
        key={formKey}
        initialValues={editing ? eventToFormValues(editing) : EMPTY_EVENT_FORM}
        submitLabel={editing ? 'Guardar cambios' : 'Programar evento'}
        focusOnMount={Boolean(editing)}
        onSubmit={onSubmit}
        onCancel={editing ? onCancel : undefined}
      />
    </aside>
  );
}