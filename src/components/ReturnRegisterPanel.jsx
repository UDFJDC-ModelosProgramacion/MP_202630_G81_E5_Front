import { Link } from 'react-router-dom';
import ReturnRecordForm from './ReturnRecordForm';
import { buildEmptyReturnForm } from '../services/returnRecordMapper';

const REGISTER_HINT =
  'Al registrar la devolución, la adopción pasa a «Devuelta» y la mascota vuelve a estar disponible para adopción.';

export default function ReturnRegisterPanel({ adoptionId, onSubmit }) {
  return (
    <section className="form-card" aria-labelledby="return-register-title">
      <h2 id="return-register-title" className="return-card__title">
        Registrar devolución
      </h2>
      <ReturnRecordForm
        initialValues={buildEmptyReturnForm()}
        submitLabel="Registrar devolución"
        hint={REGISTER_HINT}
        cancel={
          <Link to={`/adopciones/${adoptionId}`} className="btn-outline-brand">
            Cancelar
          </Link>
        }
        onSubmit={onSubmit}
      />
    </section>
  );
}
