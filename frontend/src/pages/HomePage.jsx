import { ArrowRight, Building2, Clock3, Flame, Gauge, Pizza, Play, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/client.js';
import { gameApi } from '../api/game.js';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { PageLoader } from '../components/PageLoader.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { difficultyLabels } from '../utils/format.js';

const difficultyDetails = {
  EASY: { icon: Sparkles, caption: '30s por pergunta', note: 'Para aquecer' },
  MEDIUM: { icon: Gauge, caption: '20s por pergunta', note: 'Mais agilidade' },
  HARD: { icon: Flame, caption: '10s por pergunta', note: 'Desafio máximo' },
};

export function HomePage() {
  const [options, setOptions] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [selectedThemeId, setSelectedThemeId] = useState(null);
  const [selectedModalityId, setSelectedModalityId] = useState(null);
  const [difficulty, setDifficulty] = useState('EASY');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [optionsResult, activeResult] = await Promise.allSettled([
        gameApi.getOptions(),
        gameApi.getActive(),
      ]);

      if (!mounted) return;
      if (optionsResult.status === 'fulfilled') {
        const data = optionsResult.value;
        setOptions(data);
        setSelectedThemeId(data.themes[0]?.id ?? null);
        setSelectedModalityId(data.modalities[0]?.id ?? null);
      } else {
        setError(getApiErrorMessage(optionsResult.reason, 'Não foi possível carregar as opções.'));
      }
      if (activeResult.status === 'fulfilled') setActiveGame(activeResult.value);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  const selectedModality = useMemo(
    () => options?.modalities.find((item) => item.id === Number(selectedModalityId)),
    [options, selectedModalityId],
  );
  const selectedPhase = selectedModality?.Phases?.find((item) => item.difficulty === difficulty);

  async function startGame() {
    if (!selectedThemeId || !selectedModalityId || !selectedPhase) return;
    setStarting(true);
    setError('');
    try {
      const game = await gameApi.start({
        themeId: Number(selectedThemeId),
        modalityId: Number(selectedModalityId),
        phaseId: Number(selectedPhase.id),
        difficulty,
      });
      navigate('/jogo', { state: { game } });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível iniciar a partida.'));
    } finally {
      setStarting(false);
    }
  }

  if (loading) return <PageLoader label="Preparando as modalidades..." />;

  return (
    <div className="page-container home-page">
      <section className="welcome-row">
        <div>
          <span className="eyebrow">Área de treinamento</span>
          <h1>Olá, {user?.name?.split(' ')[0]}. Pronto para praticar?</h1>
          <p>Escolha um contexto e ajuste o nível. Cada partida possui dez afirmações.</p>
        </div>
        <div className="concept-key" aria-label="Legenda dos conceitos">
          <span><i className="dot dot-functional" /> Funcional: o que faz</span>
          <span><i className="dot dot-quality" /> Não funcional: como deve ser</span>
        </div>
      </section>

      <ErrorMessage message={error} />

      {activeGame && (
        <section className="resume-card">
          <div className="resume-icon"><RotateCcw size={22} aria-hidden="true" /></div>
          <div>
            <span className="eyebrow">Partida em andamento</span>
            <strong>{activeGame.session.configuration?.theme?.name || 'Quiz de requisitos'} · {difficultyLabels[activeGame.session.difficulty]}</strong>
          </div>
          <button className="secondary-button" type="button" onClick={() => navigate('/jogo', { state: { game: activeGame } })}>
            Continuar <ArrowRight size={17} aria-hidden="true" />
          </button>
        </section>
      )}

      <section className="setup-card">
        <div className="setup-step">
          <div className="step-heading">
            <span className="step-number">1</span>
            <div>
              <h2>Escolha o tema</h2>
              <p>Em qual cenário você quer analisar requisitos?</p>
            </div>
          </div>
          <div className="theme-grid">
            {options?.themes.map((theme) => {
              const selected = Number(selectedThemeId) === theme.id;
              const Icon = theme.slug === 'pizzaria' ? Pizza : Building2;
              return (
                <button
                  className={`selection-card theme-card${selected ? ' selected' : ''}`}
                  type="button"
                  key={theme.id}
                  onClick={() => setSelectedThemeId(theme.id)}
                  aria-pressed={selected}
                >
                  <span className="theme-icon"><Icon size={28} aria-hidden="true" /></span>
                  <span>
                    <strong>{theme.name}</strong>
                    <small>{theme.description}</small>
                  </span>
                  <i className="selection-radio" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="setup-divider" />

        <div className="setup-step">
          <div className="step-heading">
            <span className="step-number">2</span>
            <div>
              <h2>Defina a dificuldade</h2>
              <p>Quanto maior o nível, menor o tempo e maior o multiplicador.</p>
            </div>
          </div>
          <div className="difficulty-grid">
            {selectedModality?.Phases?.map((phase) => {
              const details = difficultyDetails[phase.difficulty];
              const Icon = details.icon;
              const selected = difficulty === phase.difficulty;
              return (
                <button
                  className={`selection-card difficulty-card difficulty-card-${phase.difficulty.toLowerCase()}${selected ? ' selected' : ''}`}
                  type="button"
                  key={phase.id}
                  onClick={() => setDifficulty(phase.difficulty)}
                  aria-pressed={selected}
                >
                  <Icon size={22} aria-hidden="true" />
                  <span>
                    <strong>{difficultyLabels[phase.difficulty]}</strong>
                    <small>{details.note}</small>
                  </span>
                  <span className="time-chip"><Clock3 size={14} /> {phase.timeLimitSeconds}s</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="start-row">
          <div>
            <strong>{selectedPhase?.questionCount ?? 10} perguntas</strong>
            <span> · Modalidade {selectedModality?.name ?? 'Clássica'}</span>
          </div>
          <button className="primary-button start-button" type="button" disabled={starting || !selectedPhase} onClick={startGame}>
            <Play size={18} fill="currentColor" aria-hidden="true" />
            {starting ? 'Preparando...' : 'Iniciar partida'}
          </button>
        </div>
      </section>
    </div>
  );
}

