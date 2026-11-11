import { useNavigate, useParams } from 'react-router-dom';
import AdopterProfileCard from '../components/AdopterProfileCard';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import useAdopter from '../hooks/useAdopter';
import { updateAdopter } from '../services/adopterService';
import { adopterToFormValues, buildAdopterPayload } from '../services/adopterMapper';
import { ADOPTER_NOT_FOUND_MESSAGE } from '../utils/adopterMessages';
import AdopterForm from '../components/AdopterForm';

export default function AdopterEditPage() {
const { id } = useParams();
const navigate = useNavigate();
const { adopter, loading, error, notFound } = useAdopter(id);

const handleSubmit = async (values) => {
    await updateAdopter(adopter.id, buildAdopterPayload(values, adopter));
    await navigate(`/adoptantes/${adopter.id}`, {
    state: { message: 'Cambios guardados correctamente.' },
    });
};

return (
    <section>
    <div className="page-header">
        <div>
        <h1 className="page-title">Mi perfil</h1>
        <p className="page-subtitle">Mantén tus datos de contacto al día.</p>
        </div>
    </div>

    {loading && <Loader label="Cargando perfil..." />}

    {!loading && error && (
        <AlertMessage>{notFound ? ADOPTER_NOT_FOUND_MESSAGE : error}</AlertMessage>
    )}

    {adopter && (
        <div className="adopter-profile">
        <AdopterProfileCard adopter={adopter} />
        <AdopterForm
            initialValues={adopterToFormValues(adopter)}
            submitLabel="Guardar"
            cancelTo={`/adoptantes/${adopter.id}`}
            onSubmit={handleSubmit}
        />
        </div>
    )}
    </section>
);
}
