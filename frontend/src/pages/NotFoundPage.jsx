import { ArrowLeft, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <SearchX size={44} aria-hidden="true" />
      <span className="eyebrow">Erro 404</span>
      <h1>Esta página não foi encontrada.</h1>
      <p>Volte ao início para escolher uma nova partida.</p>
      <Link className="primary-button" to="/"><ArrowLeft size={17} /> Voltar ao início</Link>
    </div>
  );
}

