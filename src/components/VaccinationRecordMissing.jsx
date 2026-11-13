import { Link } from 'react-router-dom';
import AlertMessage from './AlertMessage';
import { VACCINATION_RECORD_NOT_FOUND_MESSAGE } from '../utils/vaccinationRecordMessages';

export default function VaccinationRecordMissing({ pet, showAlert = true }) {
  return (
    <>
      {showAlert && <AlertMessage>{VACCINATION_RECORD_NOT_FOUND_MESSAGE}</AlertMessage>}
      <Link to={`/mascotas/${pet.id}/carnet/nuevo`} className="btn-brand">
        Registrar carnet
      </Link>
    </>
  );
}