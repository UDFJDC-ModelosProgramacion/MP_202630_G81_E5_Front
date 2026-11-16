import AlertMessage from './AlertMessage';
import { displayValue } from '../utils/formatters';

// Tarjeta "Mis datos" del mockup. Los botones los pone quien la use (children)
// y el aviso de error (por ejemplo al no poder eliminar) sale debajo de ellos.
export default function AdopterDataCard({ adopter, children, error = null }) {
const fields = [
    ['Nombre', adopter.name],
    ['Correo electrónico', adopter.email],
    ['Teléfono', adopter.phone],
];

return (
    <div className="detail-card">
    <h2 className="adopter-card__title">Mis datos</h2>
    <dl className="detail-list adopter-data-list">
        {fields.map(([label, value]) => (
        <div key={label} className="detail-list__item">
            <dt>{label}</dt>
            <dd>{displayValue(value)}</dd>
        </div>
        ))}
    </dl>
    {children && <div className="adopter-card__actions">{children}</div>}
    {error && (
        <div className="adopter-card__alert">
        <AlertMessage>{error}</AlertMessage>
        </div>
    )}
    </div>
);
}
