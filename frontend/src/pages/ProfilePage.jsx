import { Award, CheckCircle2, CircleX, Gamepad2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/client.js';
import { rankingApi } from '../api/ranking.js';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { PageLoader } from '../components/PageLoader.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { difficultyLabels, formatDate, formatDuration, initials } from '../utils/format.js';

export function ProfilePage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([rankingApi.summary(), rankingApi.history({ limit: 10 })])
      .then(([summaryData, historyData]) => {
        if (mounted) { setSummary(summaryData); setHistory(historyData); }
      })
      .catch((requestError) => { if (mounted) setError(getApiErrorMessage(requestError, 'Não foi possível carregar seu perfil.')); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <PageLoader label="Carregando seu progresso..." />;

  const stats = [
    { icon: Gamepad2, label: 'Partidas concluídas', value: summary?.completedGames ?? 0 },
    { icon: Award, label: 'Melhor pontuação', value: Number(summary?.bestScore ?? 0).toLocaleString('pt-BR') },
    { icon: CheckCircle2, label: 'Respostas corretas', value: summary?.correctAnswers ?? 0 },
    { icon: CircleX, label: 'Respostas incorretas', value: summary?.incorrectAnswers ?? 0 },
  ];

  return (
    <div className="page-container profile-page">
      <section className="profile-hero">
        <div className="profile-avatar">{initials(user?.name)}</div>
        <div><span className="eyebrow">Seu progresso</span><h1>{user?.name}</h1><p>{user?.email}</p></div>
        <span className="profile-level"><Sparkles size={16} /> Jogador</span>
      </section>
      <ErrorMessage message={error} />
      <section className="stat-grid profile-stats">
        {stats.map(({ icon: Icon, label, value }) => <article key={label}><Icon size={21} /><span>{label}</span><strong>{value}</strong></article>)}
      </section>
      <section className="history-card">
        <div className="section-heading"><div><span className="eyebrow">Histórico</span><h2>Partidas recentes</h2></div></div>
        {history?.items?.length ? (
          <div className="history-list">
            {history.items.map((item) => (
              <article key={item.id}>
                <div><strong>{item.Theme?.name || item.configuration?.theme?.name || 'Quiz de requisitos'}</strong><span>{difficultyLabels[item.difficulty]} · {formatDate(item.finishedAt || item.startedAt)}</span></div>
                <div><strong>{Number(item.score).toLocaleString('pt-BR')} pts</strong><span>{formatDuration(item.totalTimeMs)}</span></div>
              </article>
            ))}
          </div>
        ) : <div className="empty-card">Conclua sua primeira partida para ver o histórico.</div>}
      </section>
    </div>
  );
}

