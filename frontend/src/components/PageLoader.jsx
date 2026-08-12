export function PageLoader({ label = 'Carregando...', fullScreen = false }) {
  return (
    <div className={`loader-wrap${fullScreen ? ' loader-full' : ''}`} role="status">
      <span className="loader" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

