const EMPTY_VALUE = '—';

function formatValue(value) {
  return value === null || value === undefined ? EMPTY_VALUE : value;
}

export default function HomeStats({ availablePets, totalPets, shelters }) {
  const items = [
    { label: 'Mascotas disponibles', value: availablePets },
    { label: 'Mascotas registradas', value: totalPets },
    { label: 'Refugios aliados', value: shelters },
  ];

  return (
    <dl className="home-stats" aria-label="Resumen">
      {items.map(({ label, value }) => (
        <div key={label} className="home-stats__item">
          <dt>{label}</dt>
          <dd>{formatValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}