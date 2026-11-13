import { parseVaccines } from '../utils/vaccinationRecordFormatters';

export default function VaccineChips({ vaccines }) {
  const items = [...new Set(parseVaccines(vaccines))];

  return (
    <ul className="vaccination-chips" aria-label="Vacunas aplicadas">
      {items.map((vaccine) => (
        <li key={vaccine} className="vaccination-chips__item">
          {vaccine}
        </li>
      ))}
    </ul>
  );
}