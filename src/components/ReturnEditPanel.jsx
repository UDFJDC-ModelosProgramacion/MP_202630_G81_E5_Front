import ReturnRecordForm from './ReturnRecordForm';
import { returnToFormValues } from '../services/returnRecordMapper';

export default function ReturnEditPanel({ returnRecord, onSubmit, onCancel }) {
  return (
    <section className="form-card" aria-labelledby="return-edit-title">
      <h2 id="return-edit-title" className="return-card__title">
        Editar devolución
      </h2>
      <ReturnRecordForm
        initialValues={returnToFormValues(returnRecord)}
        submitLabel="Guardar cambios"
        cancel={
          <button type="button" className="btn-outline-brand" onClick={onCancel}>
            Cancelar
          </button>
        }
        onSubmit={onSubmit}
      />
    </section>
  );
}
