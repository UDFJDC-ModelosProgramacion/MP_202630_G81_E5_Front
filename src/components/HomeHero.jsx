import { Link } from 'react-router-dom';

export default function HomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <p className="home-hero__eyebrow">Sistema de adopción de mascotas</p>
      <h1 id="home-hero-title" className="home-hero__title">
        Encuentra un nuevo hogar para cada mascota
      </h1>
      <p className="home-hero__text">
        Administra mascotas, adopciones, adoptantes y refugios desde un solo lugar.
      </p>
      <div className="home-hero__actions">
        <Link to="/mascotas" className="btn-brand">
          Ver mascotas disponibles
        </Link>
        <Link to="/adopciones/nueva" className="btn-outline-brand">
          Registrar adopción
        </Link>
      </div>
    </section>
  );
}