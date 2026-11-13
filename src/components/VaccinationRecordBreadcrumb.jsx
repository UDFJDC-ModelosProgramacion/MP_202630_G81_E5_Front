import { Link } from 'react-router-dom';

export default function VaccinationRecordBreadcrumb({ pet, current }) {
  return (
    <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
      <Link to="/mascotas">Mascotas</Link>
      {pet && (
        <>
          {' / '}
          <Link to={`/mascotas/${pet.id}`}>{pet.name}</Link>
        </>
      )}
      {' / '}
      {pet && current ? (
        <>
          <Link to={`/mascotas/${pet.id}/carnet`}>Carnet de vacunación</Link>
          {` / ${current}`}
        </>
      ) : (
        'Carnet de vacunación'
      )}
    </nav>
  );
}