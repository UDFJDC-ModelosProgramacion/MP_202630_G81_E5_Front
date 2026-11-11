import { Link, useNavigate } from 'react-router-dom';
import AdopterForm from '../components/AdopterForm';
import { createAdopter } from '../services/adopterService';
import { buildAdopterPayload, EMPTY_ADOPTER_FORM } from '../services/adopterMapper';

export default function AdopterCreatePage() {
const navigate = useNavigate();

const handleSubmit = async (values) => {
    await createAdopter(buildAdopterPayload(values));
    await navigate('/adoptantes', { state: { message: 'Adoptante registrado correctamente.' } });
};

return (
    <section className="narrow-page">
    <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/adoptantes">Adoptantes</Link> / Registrar adoptante
    </nav>

    <div className="page-header">
        <div>
        <h1 className="page-title">Registrar adoptante</h1>
        <p className="page-subtitle">Nombre y correo electrónico son obligatorios.</p>
        </div>
    </div>

    <AdopterForm
        initialValues={EMPTY_ADOPTER_FORM}
        submitLabel="Registrar adoptante"
        cancelTo="/adoptantes"
        onSubmit={handleSubmit}
    />
    </section>
);
}
