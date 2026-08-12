export function ProgressBar({ current, total }) {
  const safeTotal = Math.max(1, Number(total));
  const safeCurrent = Math.min(safeTotal, Math.max(0, Number(current)));
  const percentage = (safeCurrent / safeTotal) * 100;

  return (
    <div className="progress-group">
      <div className="progress-label">
        <span>Progresso</span>
        <strong>{safeCurrent} de {safeTotal}</strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Progresso da partida"
        aria-valuemin="0"
        aria-valuemax={safeTotal}
        aria-valuenow={safeCurrent}
      >
        <span style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

