import { formatVaccinationDate } from '../utils/vaccinationRecordFormatters';
import VaccineChips from './VaccineChips';

export default function VaccinationRecordCard({ pet, record, onDelete, deleting = false }) {
  const petSummary = [pet.name, pet.species].filter(Boolean).join(' · ');

  return (
    <div className="detail-card vaccination-card">
      <h2 className="vaccination-card__title">Carnet de {pet.name}</h2>
      <p className="vaccination-card__label">Vacunas aplicadas</p>
      <VaccineChips vaccines={record.vaccinesApplied} />
      <dl className="vaccination-card__facts">
        <div>
          <dt>Próxima vacunación</dt>
          <dd>{formatVaccinationDate(record.nextDueDate)}</dd>
        </div>
        <div>
          <dt>Mascota</dt>
          <dd>{petSummary}</dd>
        </div>
      </dl>
      {onDelete && (
        <button
          type="button"
          className="pet-table__action pet-table__action--danger"
          disabled={deleting}
          onClick={onDelete}
        >
          Eliminar carnet
        </button>
      )}
    </div>
  );
}