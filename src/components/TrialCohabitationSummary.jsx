import { formatAdoptionDate } from '../utils/adoptionFormatters';
import { displayValue } from '../utils/formatters';
import { formatPetSummary } from '../utils/returnRecordFormatters';
import { TRIAL_COHABITATION_EMPTY_NOTE } from '../utils/trialCohabitationMessages';

export default function TrialCohabitationSummary({ adoption, hasTrialCohabitation }) {
  const { pet, adopter, responsibleVeterinarian: veterinarian } = adoption;
  const petSummary = formatPetSummary(pet);

  return (
    <section className="detail-card return-summary" aria-labelledby="trial-summary-title">
      <h2 id="trial-summary-title" className="return-card__title">
        Resumen de la adopción
      </h2>
      <dl className="return-summary__list">
        <div>
          <dt>Mascota</dt>
          <dd className="return-summary__value">{displayValue(pet?.name)}</dd>
          {petSummary && <dd className="return-summary__detail">{petSummary}</dd>}
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
      {!hasTrialCohabitation && (
        <p className="return-summary__note">{TRIAL_COHABITATION_EMPTY_NOTE}</p>
      )}
    </section>
  );
}