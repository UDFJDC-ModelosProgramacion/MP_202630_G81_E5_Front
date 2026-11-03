import PhotoForm from './PhotoForm';
import PhotoGrid from './PhotoGrid';
import PhotoTabs from './PhotoTabs';
import {
  buildOwnerTargets,
  EMPTY_PHOTO_FORM,
  photoToFormValues,
  toTargetValue,
} from '../services/photoMapper';
import { photosPath } from '../utils/photoOwners';

export default function PhotoWorkspace({
  owner,
  entity,
  photos,
  editing,
  formKey,
  onEdit,
  onCancel,
  onSubmit,
}) {
  const ownerTarget = toTargetValue(owner, entity.id);
  const initialValues = editing
    ? photoToFormValues(editing, ownerTarget)
    : { ...EMPTY_PHOTO_FORM, target: ownerTarget };

  return (
    <div className="photo-layout">
      <div>
        <PhotoTabs owner={owner} entity={entity} />
        <div className="photo-card">
          <h2 className="photo-card__title">Fotos de {entity.name}</h2>
          {photos.length === 0 ? (
            <p className="empty-state">Aún no hay fotos de {entity.name}.</p>
          ) : (
            <PhotoGrid
              photos={photos}
              ownerName={entity.name}
              basePath={photosPath(owner, entity.id)}
              onEdit={onEdit}
            />
          )}
        </div>
      </div>
      <PhotoForm
        key={editing ? `edit-${editing.id}` : `new-${formKey}`}
        initialValues={initialValues}
        targets={buildOwnerTargets(owner, entity)}
        isEditing={Boolean(editing)}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  );
}