import { Link } from 'react-router-dom';
import { buildPhotoTabs } from '../utils/photoOwners';

export default function PhotoTabs({ owner, entity }) {
  return (
    <nav className="photo-tabs" aria-label="Tipo de fotos">
      {buildPhotoTabs(owner, entity).map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          className={`photo-tabs__tab${tab.active ? ' photo-tabs__tab--active' : ''}`}
          aria-current={tab.active ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}