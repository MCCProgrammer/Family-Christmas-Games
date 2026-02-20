
import React from 'react';
import { Team, GameHistory, Game } from '../types';

interface Props {
  teams: Team[];
  history: GameHistory[];
  games: Game[];
}

const Scoreboard: React.FC<Props> = ({ teams, history, games }) => {
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="p-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Tabela de Classificação</h2>
        <p className="text-slate-500">Quem está à frente na corrida do Natal?</p>
      </div>

      <div className="space-y-4 mb-12">
        {sortedTeams.map((team, index) => (
          <div key={team.id} className="relative group overflow-hidden bg-white rounded-2xl border-2 border-slate-100 p-4 flex items-center justify-between transition-all hover:scale-[1.02] hover:shadow-lg">
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${team.color}`} />
            <div className="flex items-center gap-4">
              <span className={`text-2xl font-black italic w-8 text-center ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-600' : 'text-slate-300'}`}>
                {index + 1}º
              </span>
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  {team.name} {index === 0 && '👑'}
                </h3>
                <p className="text-xs text-slate-400">{team.members.length} jogadores</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">{team.points}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">pts</span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="text-xl">📜</span> Histórico de Jogos
        </h3>
        <div className="bg-slate-50 rounded-2xl overflow-hidden divide-y divide-slate-200">
          {[...history].reverse().map((entry, idx) => {
            const team = teams.find(t => t.id === entry.teamId);
            const game = games.find(g => g.id === entry.gameId);
            return (
              <div key={idx} className="p-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${team?.color}`} />
                   <div className="flex flex-col">
                     <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">{team?.name}</span>
                        <span className="text-slate-400 text-[10px]">em {game?.name}</span>
                     </div>
                     {entry.numericScore !== undefined && (
                       <span className="text-[10px] text-blue-500 font-bold uppercase">{entry.numericScore} {game?.scoreMetric?.split(' ').pop() || 'Unidades'}</span>
                     )}
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  {entry.timeSpent !== undefined && entry.timeSpent > 0 && (
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      ⏱️ {formatTime(entry.timeSpent)}
                    </span>
                  )}
                  <span className="text-emerald-600 font-black">+{entry.points}</span>
                </div>
              </div>
            );
          })}
          {history.length === 0 && (
            <div className="p-8 text-center text-slate-400 italic text-sm">Ainda sem registos... Ide jogar!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
