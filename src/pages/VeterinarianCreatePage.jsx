import { Link, useNavigate } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import VeterinarianForm from '../components/VeterinarianForm';
import useShelters from '../hooks/useShelters';
import {
  buildVeterinarianPayload,
  EMPTY_VETERINARIAN_FORM,
} from '../services/veterinarianMapper';
import { createVeterinarian } from '../services/veterinarianService';

export default function VeterinarianCreatePage() {
  const navigate = useNavigate();
  const { shelters, loading, error } = useShelters();

  const handleSubmit = async (values) => {
    await createVeterinarian(buildVeterinarianPayload(values));
    await navigate('/veterinarios', {
      state: { message: 'Veterinario registrado correctamente.' },
    });
  };

  return (
    <section className="narrow-page">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/veterinarios">Veterinarios</Link> / Registrar veterinario
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Registrar veterinario</h1>
          <p className="page-subtitle">Nombre, correo y especialidad son obligatorios.</p>
        </div>
      </div>

      {loading && <Loader label="Cargando refugios..." />}
      {!loading && error && <AlertMessage>{error}</AlertMessage>}
      {!loading && (
        <VeterinarianForm
          initialValues={EMPTY_VETERINARIAN_FORM}
          shelters={shelters}
          submitLabel="Registrar veterinario"
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}