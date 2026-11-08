import VideoForm from './VideoForm';
import { EMPTY_VIDEO_FORM, videoToFormValues } from '../services/videoMapper';

export default function VideoPanel({
  editing,
  formKey,
  shelterId,
  shelterOptions,
  onShelterChange,
  onSubmit,
  onCancel,
}) {
  return (
    <aside className="video-card" aria-labelledby="video-panel-title">
      <h2 id="video-panel-title" className="video-card__title">
        {editing ? 'Editar video' : 'Cargar video'}
      </h2>
      <VideoForm
        key={formKey}
        initialValues={editing ? videoToFormValues(editing) : EMPTY_VIDEO_FORM}
        submitLabel={editing ? 'Guardar cambios' : 'Cargar video'}
        focusOnMount={Boolean(editing)}
        shelterId={shelterId}
        shelterOptions={shelterOptions}
        shelterLocked={Boolean(editing)}
        onShelterChange={onShelterChange}
        onSubmit={onSubmit}
        onCancel={editing ? onCancel : undefined}
      />
    </aside>
  );
}