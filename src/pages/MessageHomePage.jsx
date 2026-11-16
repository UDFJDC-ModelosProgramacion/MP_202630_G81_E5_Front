import { Navigate } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import useReviewAdopter from '../hooks/useReviewAdopter';

export default function MessageHomePage() {
  const { adopter, loading, error } = useReviewAdopter();

  if (adopter) return <Navigate to={`/adoptantes/${adopter.id}/mensajes`} replace />;

  return (
    <section>
      <h1 className="page-title">Mis mensajes</h1>
      {loading && <Loader label="Buscando tu perfil de adoptante..." />}
      {!loading && error && <AlertMessage>{error}</AlertMessage>}
      {!loading && !error && (
        <p className="empty-state">Aún no hay adoptantes registrados para enviar mensajes.</p>
      )}
    </section>
  );
}