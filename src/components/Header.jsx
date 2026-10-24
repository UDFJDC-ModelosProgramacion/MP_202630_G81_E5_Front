import { NavLink } from 'react-router-dom';

// Las secciones sin `to` siguen deshabilitadas hasta que se implemente su historia.
const navItems = [
  { label: 'Mascotas', to: '/mascotas' },
  { label: 'Adoptantes' },
  { label: 'Adopciones', to: '/adopciones' },
  { label: 'Refugios' },
];

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-brand">
        <div className="app-brand__logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
            <circle cx="5" cy="11" r="2.2" />
            <circle cx="9" cy="6" r="2.2" />
            <circle cx="15" cy="6" r="2.2" />
            <circle cx="19" cy="11" r="2.2" />
            <path d="M12 11c-3 0-6 3-6 6 0 2 1.5 3 3 3 1.2 0 2-.6 3-.6s1.8.6 3 .6c1.5 0 3-1 3-3 0-3-3-6-6-6z" />
          </svg>
        </div>
        <span className="app-brand__name">AdoptaYa</span>
      </div>

            <nav className="app-nav" aria-label="Principal">
        {navItems.map(({ label, to }) =>
          to ? (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `app-nav__link${isActive ? ' app-nav__link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          ) : (
            <a
              key={label}
              href="#"
              className="app-nav__link"
              aria-disabled="true"
              onClick={(e) => e.preventDefault()}
            >
              {label}
            </a>
          ),
        )}
      </nav>

      <div className="app-user">
        <div className="app-user__avatar" aria-hidden="true">AD</div>
        <div>
          <div className="app-user__name">Administrador</div>
          <div className="app-user__role">Refugio Adopciones</div>
        </div>
      </div>
    </header>
  );
}