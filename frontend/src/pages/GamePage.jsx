import { ChevronLeft, Flag, Layers3, Star } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/client.js';
import { gameApi } from '../api/game.js';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { FeedbackToast } from '../components/FeedbackToast.jsx';
import { PageLoader } from '../components/PageLoader.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { QuestionCard } from '../components/QuestionCard.jsx';
import { Timer } from '../components/Timer.jsx';
import { useTimer } from '../hooks/useTimer.js';
import { difficultyLabels } from '../utils/format.js';

export function GamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [game, setGame] = useState(location.state?.game ?? null);
  const [loading, setLoading] = useState(!location.state?.game);
  const [answering, setAnswering] = useState(false);
  const [feedback, setFeedback] = useState(location.state?.game?.feedback ?? null);
  const [error, setError] = useState('');

  const goToResult = useCallback((nextGame) => {
    const result = nextGame.result;
    navigate(`/resultado/${nextGame.session.id}`, { replace: true, state: { result } });
  }, [navigate]);

  const refreshAfterTimeout = useCallback(async () => {
    if (answering) return;
    setAnswering(true);
    try {
      const nextGame = await gameApi.getActive();
      if (nextGame.session.status === 'COMPLETED') {
        goToResult(nextGame);
        return;
      }
      setGame(nextGame);
      setFeedback(nextGame.feedback ?? null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível avançar após o tempo esgotado.'));
    } finally {
      setAnswering(false);
    }
  }, [answering, goToResult]);

  const timer = useTimer(
    game?.currentQuestion?.deadlineAt,
    game?.currentQuestion?.timeLimitMs,
    refreshAfterTimeout,
  );

  useEffect(() => {
    if (game) return undefined;
    let mounted = true;
    gameApi.getActive()
      .then((active) => {
        if (!mounted) return;
        if (active.session.status === 'COMPLETED') goToResult(active);
        else setGame(active);
      })
      .catch((requestError) => {
        if (mounted) setError(getApiErrorMessage(requestError, 'Nenhuma partida ativa foi encontrada.'));
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [game, goToResult]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timerId = window.setTimeout(() => setFeedback(null), 3500);
    return () => window.clearTimeout(timerId);
  }, [feedback]);

  async function answer(alternativeId) {
    if (!game || answering) return;
    setAnswering(true);
    setError('');
    try {
      const nextGame = await gameApi.answer(game.session.id, alternativeId);
      if (nextGame.session.status === 'COMPLETED') {
        goToResult(nextGame);
        return;
      }
      setGame(nextGame);
      setFeedback(nextGame.feedback ?? null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível registrar sua resposta.'));
    } finally {
      setAnswering(false);
    }
  }

  async function abandon() {
    if (!game || !window.confirm('Deseja abandonar esta partida? O resultado não entrará no ranking.')) return;
    try {
      await gameApi.abandon(game.session.id);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível abandonar a partida.'));
    }
  }

  if (loading) return <PageLoader label="Recuperando a partida..." />;
  if (!game?.currentQuestion) {
    return (
      <div className="page-container narrow-page">
        <ErrorMessage message={error || 'Partida indisponível.'} />
        <button className="secondary-button" type="button" onClick={() => navigate('/')}>Voltar ao início</button>
      </div>
    );
  }

  const { session, currentQuestion } = game;

  return (
    <div className="game-page">
      <div className="game-topbar">
        <button className="text-button" type="button" onClick={abandon}>
          <ChevronLeft size={18} aria-hidden="true" /> Abandonar
        </button>
        <div className="game-context">
          <span><Layers3 size={16} /> {session.configuration?.theme?.name || 'Quiz de requisitos'}</span>
          <span className={`difficulty-pill difficulty-${session.difficulty.toLowerCase()}`}>{difficultyLabels[session.difficulty]}</span>
        </div>
        <span className="score-chip"><Star size={17} fill="currentColor" /> {Number(session.score).toLocaleString('pt-BR')} pts</span>
      </div>

      <div className="game-container">
        <FeedbackToast feedback={feedback} />
        <ErrorMessage message={error} />

        <div className="game-status-grid">
          <ProgressBar current={currentQuestion.position} total={currentQuestion.totalQuestions} />
          <Timer {...timer} />
        </div>

        <QuestionCard question={currentQuestion} disabled={answering || timer.secondsLeft === 0} onAnswer={answer} />

        <div className="game-footnote">
          <Flag size={16} aria-hidden="true" />
          <span>A resposta correta e os pontos são validados pelo servidor.</span>
        </div>
      </div>
    </div>
  );
}

