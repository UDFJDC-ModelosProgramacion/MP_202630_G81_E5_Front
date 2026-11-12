import { getAdoptionStatusLabel } from '../utils/adoptionOptions';

export default function AdoptionStatusBadge({ status }) {
  const modifier = String(status ?? '').toLowerCase().replaceAll('_', '-');

  return (
    <span className={`status-badge adoption-status adoption-status--${modifier}`}>
      {getAdoptionStatusLabel(status)}
    </span>
  );
}
