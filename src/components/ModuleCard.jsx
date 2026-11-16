import { Link } from 'react-router-dom';

export default function ModuleCard({ title, description, to }) {
  return (
    <li className="module-card">
      <h3 className="module-card__title">
        <Link to={to} className="module-card__link">
          {title}
        </Link>
      </h3>
      <p className="module-card__text">{description}</p>
    </li>
  );
}