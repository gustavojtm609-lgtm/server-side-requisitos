import { Cog, Sparkles } from 'lucide-react';

export function QuestionCard({ question, disabled, onAnswer }) {
  return (
    <section className="question-card" aria-labelledby="question-title">
      <span className="eyebrow">Classifique a afirmação</span>
      <h1 id="question-title">{question.statement}</h1>
      <p className="question-hint">Qual tipo de requisito está sendo descrito?</p>

      <div className="answer-grid">
        {question.alternatives.map((alternative) => {
          const functional = alternative.type === 'FUNCTIONAL';
          const Icon = functional ? Cog : Sparkles;
          return (
            <button
              type="button"
              className={`answer-button ${functional ? 'answer-functional' : 'answer-quality'}`}
              key={alternative.id}
              disabled={disabled}
              onClick={() => onAnswer(alternative.id)}
            >
              <span className="answer-icon"><Icon size={25} aria-hidden="true" /></span>
              <span>
                <strong>{alternative.label}</strong>
                <small>
                  {functional
                    ? 'Descreve o que o sistema deve fazer'
                    : 'Descreve qualidade, limite ou restrição'}
                </small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

