import ReviewForm from './ReviewForm';
import { reviewToFormValues, EMPTY_REVIEW_FORM } from '../services/reviewMapper';

export default function ReviewPanel({ editing, formKey, onSubmit, onCancel }) {
  return (
    <aside aria-labelledby="review-panel-title">
      <h2 id="review-panel-title" className="review-panel__title">
        {editing ? 'Editar reseña' : 'Nueva reseña'}
      </h2>
      <ReviewForm
        key={formKey}
        initialValues={editing ? reviewToFormValues(editing) : EMPTY_REVIEW_FORM}
        submitLabel={editing ? 'Guardar cambios' : 'Publicar reseña'}
        focusOnMount={Boolean(editing)}
        onSubmit={onSubmit}
        onCancel={editing ? onCancel : undefined}
      />
    </aside>
  );
}
