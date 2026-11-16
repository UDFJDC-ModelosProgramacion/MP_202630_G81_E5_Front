import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import AdopterProfileCard from '../components/AdopterProfileCard';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import useAdopter from '../hooks/useAdopter';
import { ADOPTER_NOT_FOUND_MESSAGE } from '../utils/adopterMessages';

export default function AdopterDetailPage() {
const { id } = useParams();
const location = useLocation();
const { adopter, loading, error, notFound } = useAdopter(id);
const [message] = useState(() => location.state?.message ?? null);

return (
    <section>
    <div className="page-header">
        <div>
        <h1 className="page-title">Mi perfil</h1>
        <p className="page-subtitle">Mantén tus datos de contacto al día.</p>
        </div>
    </div>

    {message && <AlertMessage variant="success">{message}</AlertMessage>}

    {loading && <Loader label="Cargando perfil..." />}

    {!loading && error && (
        <AlertMessage>{notFound ? ADOPTER_NOT_FOUND_MESSAGE : error}</AlertMessage>
    )}

    {adopter && (
        <div className="adopter-profile">
        <AdopterProfileCard adopter={adopter} showEdit />
        </div>
    )}
    </section>
);
}