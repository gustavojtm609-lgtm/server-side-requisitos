import { Clock3 } from 'lucide-react';

export function Timer({ secondsLeft, percentage, urgency }) {
  return (
    <div className={`timer timer-${urgency}`} aria-live="polite">
      <div className="timer-copy">
        <Clock3 size={18} aria-hidden="true" />
        <span>Tempo</span>
        <strong>{secondsLeft}s</strong>
      </div>
      <div className="timer-track" aria-hidden="true">
        <span style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

