import StatusBadge from './StatusBadge';
import { formatAdoptionDate } from '../utils/adoptionFormatters';
import { displayValue } from '../utils/formatters';
import { NO_RETURN_RECORD_MESSAGE } from '../utils/returnRecordMessages';
import { formatPetSummary } from '../utils/returnRecordFormatters';

export default function ReturnAdoptionSummary({ adoption, hasReturnRecord }) {
  const { pet, adopter, responsibleVeterinarian: veterinarian } = adoption;
  const petSummary = formatPetSummary(pet);

  return (
    <section className="detail-card return-summary" aria-labelledby="return-summary-title">
      <h2 id="return-summary-title" className="return-card__title">
        Resumen de la adopción
      </h2>
      <dl className="return-summary__list">
        <div>
          <dt>Mascota</dt>
          <dd className="return-summary__value">{displayValue(pet?.name)}</dd>
          {petSummary && <dd className="return-summary__detail">{petSummary}</dd>}
          {pet?.available && (
            <dd className="return-summary__detail">
              <StatusBadge available />
            </dd>
          )}
        </div>
        <div>
          <dt>Adoptante</dt>
          <dd className="return-summary__value">{displayValue(adopter?.name)}</dd>
        </div>
        <div>
          <dt>Veterinario responsable</dt>
          <dd className="return-summary__value">{displayValue(veterinarian?.name)}</dd>
        </div>
        <div>
          <dt>Fecha de adopción</dt>
          <dd className="return-summary__value">{formatAdoptionDate(adoption.date)}</dd>
        </div>
      </dl>
      {!hasReturnRecord && <p className="return-summary__note">{NO_RETURN_RECORD_MESSAGE}</p>}
    </section>
  );
}
