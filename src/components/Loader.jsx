export default function Loader({ label = 'Cargando...' }) {
  return (
    <div className="loader" role="status">
      <div className="spinner-border" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}