import { Crown, Filter, RefreshCcw, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/client.js';
import { gameApi } from '../api/game.js';
import { rankingApi } from '../api/ranking.js';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { PageLoader } from '../components/PageLoader.jsx';
import { RankingTable } from '../components/RankingTable.jsx';
import { difficultyLabels } from '../utils/format.js';

export function RankingPage() {
  const [options, setOptions] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [filters, setFilters] = useState({ themeId: '', difficulty: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRanking = useCallback(async (currentFilters) => {
    setLoading(true);
    setError('');
    try {
      const cleanFilters = Object.fromEntries(Object.entries(currentFilters).filter(([, value]) => value));
      setRanking(await rankingApi.leaderboard(cleanFilters));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar o ranking.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    gameApi.getOptions().then(setOptions).catch(() => setOptions(null));
  }, []);

  useEffect(() => {
    let mounted = true;
    rankingApi.leaderboard()
      .then((data) => { if (mounted) setRanking(data); })
      .catch((requestError) => { if (mounted) setError(getApiErrorMessage(requestError, 'Não foi possível carregar o ranking.')); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  function updateFilter(event) {
    const nextFilters = { ...filters, [event.target.name]: event.target.value };
    setFilters(nextFilters);
    loadRanking(nextFilters);
  }

  return (
    <div className="page-container ranking-page">
      <section className="page-heading-row">
        <div>
          <span className="eyebrow"><Crown size={15} /> Melhores resultados</span>
          <h1>Ranking</h1>
          <p>Mais pontos vencem. Em caso de empate, o menor tempo fica à frente.</p>
        </div>
        <div className="ranking-emblem"><Trophy size={28} /></div>
      </section>

      <section className="filter-bar" aria-label="Filtros do ranking">
        <span className="filter-title"><Filter size={18} /> Filtrar por</span>
        <label>
          <span>Tema</span>
          <select name="themeId" value={filters.themeId} onChange={updateFilter}>
            <option value="">Todos os temas</option>
            {options?.themes.map((theme) => <option value={theme.id} key={theme.id}>{theme.name}</option>)}
          </select>
        </label>
        <label>
          <span>Dificuldade</span>
          <select name="difficulty" value={filters.difficulty} onChange={updateFilter}>
            <option value="">Todas</option>
            {Object.entries(difficultyLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
        <button className="icon-button bordered-icon" type="button" onClick={() => loadRanking(filters)} aria-label="Atualizar ranking"><RefreshCcw size={18} /></button>
      </section>

      <ErrorMessage message={error} />
      {loading ? <PageLoader label="Atualizando posições..." /> : <RankingTable items={ranking?.items} />}
    </div>
  );
}
