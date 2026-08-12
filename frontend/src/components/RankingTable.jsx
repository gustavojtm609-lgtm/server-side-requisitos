import { Medal } from 'lucide-react';
import { difficultyLabels, formatDate, formatDuration, initials } from '../utils/format.js';

export function RankingTable({ items }) {
  if (!items?.length) {
    return <div className="empty-card">Nenhum resultado encontrado para estes filtros.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="ranking-table">
        <thead>
          <tr>
            <th>Posição</th>
            <th>Jogador</th>
            <th>Tema</th>
            <th>Dificuldade</th>
            <th>Pontos</th>
            <th>Tempo</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td data-label="Posição">
                <span className={`position position-${item.position}`}>
                  {item.position <= 3 ? <Medal size={18} aria-hidden="true" /> : null}
                  {item.position}º
                </span>
              </td>
              <td data-label="Jogador">
                <span className="player-cell">
                  <span className="mini-avatar">{initials(item.User?.name)}</span>
                  <strong>{item.User?.name}</strong>
                </span>
              </td>
              <td data-label="Tema">{item.Theme?.name}</td>
              <td data-label="Dificuldade">
                <span className={`difficulty-pill difficulty-${item.difficulty?.toLowerCase()}`}>
                  {difficultyLabels[item.difficulty] || item.difficulty}
                </span>
              </td>
              <td data-label="Pontos"><strong>{Number(item.score).toLocaleString('pt-BR')}</strong></td>
              <td data-label="Tempo">{formatDuration(item.totalTimeMs)}</td>
              <td data-label="Data">{formatDate(item.completedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

