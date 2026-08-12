import { Check, Gauge, Trophy } from 'lucide-react';

export function AuthLayout({ eyebrow, title, description, children, footer }) {
  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="Apresentação do quiz">
        <div className="auth-brand">
          <span className="brand-mark brand-mark-light">RF</span>
          <span>
            <strong>Quiz de Requisitos</strong>
            <small>Treine análise de software</small>
          </span>
        </div>

        <div className="auth-story-copy">
          <span className="story-kicker">Prática que fixa</span>
          <h1>Identifique requisitos com mais confiança.</h1>
          <p>Classifique cenários reais de Pizzaria e Hotel, avance nas dificuldades e acompanhe sua evolução.</p>
          <ul>
            <li><Check size={17} aria-hidden="true" /> Feedback explicativo a cada resposta</li>
            <li><Gauge size={17} aria-hidden="true" /> Tempo ajustado à dificuldade</li>
            <li><Trophy size={17} aria-hidden="true" /> Ranking por pontos e velocidade</li>
          </ul>
        </div>

        <div className="story-orbit orbit-one" aria-hidden="true" />
        <div className="story-orbit orbit-two" aria-hidden="true" />
      </section>

      <section className="auth-form-section">
        <div className="auth-form-card">
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
          {children}
          <div className="auth-footer">{footer}</div>
        </div>
      </section>
    </main>
  );
}

