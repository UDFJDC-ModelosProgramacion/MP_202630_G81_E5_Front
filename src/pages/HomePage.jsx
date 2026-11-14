import { Link } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import HomeHero from '../components/HomeHero';
import HomeStats from '../components/HomeStats';
import Loader from '../components/Loader';
import ModuleCard from '../components/ModuleCard';
import PetCard from '../components/PetCard';
import usePets from '../hooks/usePets';
import useShelters from '../hooks/useShelters';
import { HOME_MODULES } from '../utils/homeModules';
import { getFeaturedPets, getHomeStats } from '../utils/homeStats';

export default function HomePage() {
  const { pets, loading: petsLoading, error: petsError, reload } = usePets();
  const { shelters, loading: sheltersLoading, error: sheltersError } = useShelters();

  const petsReady = !petsLoading && !petsError;
  const sheltersReady = !sheltersLoading && !sheltersError;
  const stats = getHomeStats(pets, shelters);
  const featuredPets = getFeaturedPets(pets);

  return (
    <>
      <HomeHero />

      <HomeStats
        availablePets={petsReady ? stats.availablePets : null}
        totalPets={petsReady ? stats.totalPets : null}
        shelters={sheltersReady ? stats.shelters : null}
      />

      <section className="home-section" aria-labelledby="home-pets-title">
        <div className="home-section__header">
          <h2 id="home-pets-title" className="home-section__title">
            Mascotas disponibles
          </h2>
          <Link to="/mascotas" className="home-section__link">
            Ver todas
          </Link>
        </div>

        {petsLoading && <Loader label="Cargando mascotas..." />}

        {!petsLoading && petsError && (
          <>
            <AlertMessage>{petsError}</AlertMessage>
            <button type="button" className="btn-outline-brand" onClick={reload}>
              Reintentar
            </button>
          </>
        )}

        {petsReady && featuredPets.length === 0 && (
          <p className="empty-state">No hay mascotas disponibles por ahora.</p>
        )}

        {petsReady && featuredPets.length > 0 && (
          <ul className="pet-grid">
            {featuredPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </ul>
        )}
      </section>

      <section className="home-section" aria-labelledby="home-modules-title">
        <div className="home-section__header">
          <h2 id="home-modules-title" className="home-section__title">
            Explora el sistema
          </h2>
        </div>
        <ul className="module-grid">
          {HOME_MODULES.map((module) => (
            <ModuleCard key={module.to} {...module} />
          ))}
        </ul>
      </section>
    </>
  );
}