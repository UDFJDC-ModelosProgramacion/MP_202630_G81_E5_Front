import { formatAdoptionDate } from '../utils/adoptionFormatters';
import { displayValue } from '../utils/formatters';

export default function ReturnRecordDetails({ returnRecord, deleting, onEdit, onDelete }) {
  return (
    <section className="detail-card" aria-labelledby="return-record-title">
      <h2 id="return-record-title" className="return-card__title">
        Devolución registrada
      </h2>
      <dl className="return-summary__list return-summary__list--single">
        <div>
          <dt>Fecha de devolución</dt>
          <dd className="return-summary__value">{formatAdoptionDate(returnRecord.date)}</dd>
        </div>
        <div>
          <dt>Motivo</dt>
          <dd className="return-record__reason">{displayValue(returnRecord.reason)}</dd>
        </div>
      </dl>
      <div className="return-record__actions">
        <button type="button" className="btn-outline-brand" disabled={deleting} onClick={onEdit}>
          Editar devolución
        </button>
        <button
          type="button"
          className="btn-outline-brand return-btn-danger"
          disabled={deleting}
          onClick={onDelete}
        >
          {deleting ? 'Eliminando...' : 'Eliminar devolución'}
        </button>
      </div>
    </section>
  );
}
