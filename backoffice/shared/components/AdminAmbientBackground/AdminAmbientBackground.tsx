import './admin-ambient.css';

/** Fondo ambiental fijo para el backoffice (blobs con blur, patrón Kai admin). */
export default function AdminAmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
      data-test-id="admin-ambient-bg"
    >
      <div className="relative h-full w-full overflow-hidden">
        <div className="admin-ambient-blob admin-ambient-blob--accent" />
        <div className="admin-ambient-blob admin-ambient-blob--secondary" />
        <div className="admin-ambient-blob admin-ambient-blob--soft" />
        <div className="admin-ambient-blob admin-ambient-blob--primary-mid" />
        <div className="admin-ambient-blob admin-ambient-blob--accent-low" />
        <div className="admin-ambient-blob admin-ambient-blob--success" />
      </div>
    </div>
  );
}
