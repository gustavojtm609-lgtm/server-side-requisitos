import { CheckCircle2, TimerOff, XCircle } from 'lucide-react';

export function FeedbackToast({ feedback }) {
  if (!feedback) return null;
  const status = feedback.timedOut ? 'timeout' : feedback.isCorrect ? 'correct' : 'incorrect';
  const Icon = status === 'correct' ? CheckCircle2 : status === 'timeout' ? TimerOff : XCircle;
  const title = status === 'correct' ? `Acertou! +${feedback.points} pontos` : status === 'timeout' ? 'O tempo acabou' : 'Quase! Essa não era a classificação';

  return (
    <div className={`feedback-toast feedback-${status}`} role="status">
      <Icon size={21} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <span>{feedback.explanation}</span>
      </div>
    </div>
  );
}

