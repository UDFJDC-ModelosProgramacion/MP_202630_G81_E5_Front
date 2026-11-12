export default function StatusBadge({ available }) {
  return available ? (
    <span className="status-badge status-badge--available">Disponible</span>
  ) : (
    <span className="status-badge status-badge--adopted">Adoptada</span>
  );
}