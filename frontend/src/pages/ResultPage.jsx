import { ArrowRight, CheckCircle2, Clock3, RotateCcw, Sparkles, Target, Trophy, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../api/client.js';
import { gameApi } from '../api/game.js';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { PageLoader } from '../components/PageLoader.jsx';
import { formatDuration, requirementLabels } from '../utils/format.js';

export function ResultPage() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.result ?? null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState('');

  useEffect(() => {
    if (result) return undefined;
    let mounted = true;
    gameApi.getResult(sessionId)
      .then((data) => { if (mounted) setResult(data); })
      .catch((requestError) => { if (mounted) setError(getApiErrorMessage(requestError, 'Não foi possível carregar o resultado.')); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [result, sessionId]);

  if (loading) return <PageLoader label="Calculando seu resultado..." />;
  if (!result) {
    return <div className="page-container narrow-page"><ErrorMessage message={error} /></div>;
  }

  const { session, answers, accuracy } = result;
  const excellent = accuracy >= 80;

  return (
    <div className="page-container result-page">
      <section className="result-hero">
        <div className="result-badge"><Trophy size={34} aria-hidden="true" /></div>
        <span className="eyebrow">Partida concluída</span>
        <h1>{excellent ? 'Excelente classificação!' : 'Bom treino — siga evoluindo!'}</h1>
        <p>{session.configuration.theme.name} · {session.configuration.phase.name}</p>
        <strong className="result-score">{Number(session.score).toLocaleString('pt-BR')} <small>pontos</small></strong>
      </section>

      <section className="stat-grid" aria-label="Resumo do resultado">
        <article><Target size={21} /><span>Precisão</span><strong>{accuracy}%</strong></article>
        <article><CheckCircle2 size={21} /><span>Acertos</span><strong>{session.correctAnswers}/{session.questionCount}</strong></article>
        <article><Clock3 size={21} /><span>Tempo</span><strong>{formatDuration(session.totalTimeMs)}</strong></article>
        <article><Sparkles size={21} /><span>Média</span><strong>{Math.round(session.score / session.questionCount)} pts</strong></article>
      </section>

      <div className="result-actions">
        <button className="primary-button" type="button" onClick={() => navigate('/')}><RotateCcw size={17} /> Jogar novamente</button>
        <Link className="secondary-button" to="/ranking">Ver ranking <ArrowRight size={17} /></Link>
      </div>

      <section className="review-section">
        <div className="section-heading">
          <div><span className="eyebrow">Revisão</span><h2>Entenda cada resposta</h2></div>
          <span>{answers.length} afirmações</span>
        </div>
        <div className="review-list">
          {answers.map((answer) => (
            <article className={`review-item ${answer.isCorrect ? 'review-correct' : 'review-incorrect'}`} key={`${answer.questionId}-${answer.position}`}>
              <span className="review-status">{answer.isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}</span>
              <div>
                <small>Questão {answer.position}</small>
                <h3>{answer.statement}</h3>
                <p>{answer.explanation}</p>
                <div className="review-tags">
                  {!answer.isCorrect && <span>Sua resposta: {answer.selectedType ? requirementLabels[answer.selectedType] : 'Tempo esgotado'}</span>}
                  <span>Correta: {requirementLabels[answer.correctType]}</span>
                  <strong>+{answer.points} pts</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

