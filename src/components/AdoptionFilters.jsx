import FormField from './FormField';
import { ADOPTION_STATUS_OPTIONS } from '../utils/adoptionOptions';

export default function AdoptionFilters({ search, status, onSearchChange, onStatusChange }) {
  return (
    <div className="adoption-filters">
      <div className="adoption-filters__search">
        <FormField id="adoption-search" label="Buscar">
          <input
            id="adoption-search"
            type="text"
            className="form-control-brand"
            placeholder="Mascota o adoptante"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </FormField>
      </div>
      <div className="adoption-filters__status">
        <FormField id="adoption-status-filter" label="Estado">
          <select
            id="adoption-status-filter"
            className="form-control-brand"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="">Todos</option>
            {ADOPTION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>
    </div>
  );
}
