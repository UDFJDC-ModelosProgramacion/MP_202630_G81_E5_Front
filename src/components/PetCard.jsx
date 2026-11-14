import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

function formatAge(age) {
  return `${age} ${age === 1 ? 'año' : 'años'}`;
}

export default function PetCard({ pet }) {
  const details = [pet.species, pet.breed].filter(Boolean).join(' · ');

  return (
    <li className="pet-card">
      <div className="pet-card__header">
        <Link to={`/mascotas/${pet.id}`} className="pet-card__name">
          {pet.name}
        </Link>
        <StatusBadge available={pet.available} />
      </div>
      {details && <p className="pet-card__meta">{details}</p>}
      {pet.age !== null && pet.age !== undefined && (
        <p className="pet-card__age">{formatAge(pet.age)}</p>
      )}
      {pet.shelter?.name && <p className="pet-card__meta">{pet.shelter.name}</p>}
    </li>
  );
}