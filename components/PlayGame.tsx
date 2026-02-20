
import React, { useState, useEffect, useRef } from 'react';
import { Team, Game, TeamDuelStats } from '../types';
import { ICONS } from '../constants';

interface Props {
  teams: Team[];
  games: Game[];
  onFinishGame: (gameId: string, rankings: { teamId: string, points: number, timeSpent?: number, numericScore?: number }[]) => void;
}

type PlayState = 'game-select' | 'team-match' | 'duel-active' | 'session-summary';

const PlayGame: React.FC<Props> = ({ teams, games, onFinishGame }) => {
  const [view, setView] = useState<PlayState>('game-select');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [matchTeams, setMatchTeams] = useState<{ t1: string | null, t2: string | null }>({ t1: null, t2: null });
  
  // Duel State
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [duelStats, setDuelStats] = useState<Record<string, TeamDuelStats>>({});
  const timerIntervalRef = useRef<number | null>(null);

  // Session History
  const [sessionResults, setSessionResults] = useState<Record<string, { time: number, score: number }>>({});

  const currentGame = games.find(g => g.id === selectedGameId);
  const isTimeBased = currentGame?.type === 'time-based';

  useEffect(() => {
    if (isRunning && isTimeBased) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimer(prev => prev + 10);
      }, 10);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [isRunning, isTimeBased]);

  // Stop timer automatically when both finished
  useEffect(() => {
    if (isRunning && Object.keys(duelStats).length > 0) {
      const allFinished = Object.values(duelStats).every(s => s.finished);
      if (allFinished) {
        setIsRunning(false);
      }
    }
  }, [duelStats, isRunning]);

  const startDuel = () => {
    if (!matchTeams.t1 || !matchTeams.t2) return;
    
    const initialStats = {
      [matchTeams.t1]: { teamId: matchTeams.t1, laps: [], finished: false, numericScore: 0 },
      [matchTeams.t2]: { teamId: matchTeams.t2, laps: [], finished: false, numericScore: 0 }
    };
    
    setDuelStats(initialStats);
    setTimer(0);
    setIsRunning(isTimeBased);
    setView('duel-active');
  };

  const handleCancelDuel = () => {
    if (confirm('Cancelar este duelo e voltar à seleção de equipas?')) {
      setIsRunning(false);
      setTimer(0);
      setView('team-match');
    }
  };

  const finishTeam = (teamId: string) => {
    setDuelStats(prev => {
      const stats = prev[teamId];
      if (!stats || stats.finished) return prev;
      return {
        ...prev,
        [teamId]: { ...stats, finished: true, laps: [timer] }
      };
    });
  };

  const updateNumericScore = (teamId: string, val: string) => {
    const num = parseInt(val) || 0;
    setDuelStats(prev => ({
      ...prev,
      [teamId]: { ...prev[teamId], numericScore: num, finished: true }
    }));
  };

  const calculatePointsForIndex = (idx: number, totalTeams: number) => {
    if (idx === 0) {
      const secondPlacePoints = (totalTeams > 1) ? (totalTeams - 1) : 0;
      return secondPlacePoints + 2;
    }
    return totalTeams - idx;
  };

  const saveMatch = () => {
    setIsRunning(false);
    const updatedResults = { ...sessionResults };
    
    Object.values(duelStats).forEach(stats => {
      const finalTime = stats.laps[0] || 0;
      const finalScore = stats.numericScore || 0;
      
      // Update best: if points-only, higher score is better. if time, lower is better.
      if (!updatedResults[stats.teamId]) {
        updatedResults[stats.teamId] = { time: finalTime, score: finalScore };
      } else {
        if (isTimeBased) {
          if (finalTime > 0 && finalTime < updatedResults[stats.teamId].time) {
            updatedResults[stats.teamId].time = finalTime;
          }
        } else {
          if (finalScore > updatedResults[stats.teamId].score) {
            updatedResults[stats.teamId].score = finalScore;
          }
        }
      }
    });

    setSessionResults(updatedResults);
    setView('session-summary');
  };

  const finalizeGameSession = () => {
    if (!selectedGameId) return;
    
    const sortedTeamIds = Object.keys(sessionResults).sort((a, b) => {
      if (!isTimeBased) return sessionResults[b].score - sessionResults[a].score; // Points: Descending
      return sessionResults[a].time - sessionResults[b].time; // Time: Ascending
    });
    
    const count = sortedTeamIds.length;
    
    const finalRankings = sortedTeamIds.map((tid, idx) => {
      return {
        teamId: tid,
        points: calculatePointsForIndex(idx, count),
        timeSpent: isTimeBased ? Math.floor(sessionResults[tid].time / 1000) : undefined,
        numericScore: !isTimeBased ? sessionResults[tid].score : undefined
      };
    });

    onFinishGame(selectedGameId, finalRankings);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  if (view === 'game-select') {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-black text-red-600 text-center mb-8 christmas-font">Escolher Jogo</h2>
        <div className="grid gap-4">
          {games.map(g => (
            <button key={g.id} onClick={() => { setSelectedGameId(g.id); setView('team-match'); }} className="bg-white border-4 border-red-50 p-6 rounded-3xl hover:border-red-500 transition-all text-left shadow-sm hover:shadow-md">
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">{g.type}</span>
              <h3 className="text-xl font-bold text-slate-800">{g.name}</h3>
              <p className="text-slate-500 text-sm mt-1">{g.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'team-match') {
    return (
      <div className="p-8 text-center">
        <button onClick={() => setView('game-select')} className="text-slate-400 font-bold mb-4 hover:text-red-500">← Voltar</button>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Preparar Duelo</h2>
        <p className="text-slate-500 mb-8">Seleciona as duas equipas para {currentGame?.name}</p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
          {['t1', 't2'].map((key) => (
            <div key={key} className="flex-1 w-full max-w-xs">
              <div className={`p-6 rounded-[32px] border-4 min-h-[160px] flex flex-col items-center justify-center transition-all ${matchTeams[key as keyof typeof matchTeams] ? 'bg-white border-red-500 shadow-xl' : 'bg-slate-50 border-dashed border-slate-300'}`}>
                {matchTeams[key as keyof typeof matchTeams] ? (
                  <>
                    <span className="text-4xl mb-2">⭐</span>
                    <h4 className="font-black text-xl text-slate-800">{teams.find(t => t.id === matchTeams[key as keyof typeof matchTeams])?.name}</h4>
                    <button onClick={() => setMatchTeams(prev => ({ ...prev, [key]: null }))} className="text-red-500 text-xs font-bold mt-2">Remover</button>
                  </>
                ) : (
                  <span className="text-slate-300 font-bold">Seleciona Equipa {key === 't1' ? 'A' : 'B'}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {teams.map(t => {
            const isSelected = matchTeams.t1 === t.id || matchTeams.t2 === t.id;
            return (
              <button
                key={t.id}
                disabled={isSelected}
                onClick={() => {
                  if (!matchTeams.t1) setMatchTeams(p => ({ ...p, t1: t.id }));
                  else if (!matchTeams.t2) setMatchTeams(p => ({ ...p, t2: t.id }));
                }}
                className={`p-3 rounded-2xl font-bold border-2 transition-all ${isSelected ? 'opacity-30 bg-slate-100 grayscale' : `${t.color} text-white hover:scale-105`}`}
              >
                {t.name}
              </button>
            );
          })}
        </div>

        <button 
          onClick={startDuel}
          disabled={!matchTeams.t1 || !matchTeams.t2}
          className="bg-red-600 text-white font-black px-12 py-5 rounded-full text-xl shadow-2xl disabled:opacity-30 transition-transform active:scale-95"
        >
          {isTimeBased ? 'INICIAR CRONÓMETRO! 🚀' : 'REGISTAR PONTOS! 🚀'}
        </button>
      </div>
    );
  }

  if (view === 'duel-active') {
    const teamA = teams.find(t => t.id === matchTeams.t1)!;
    const teamB = teams.find(t => t.id === matchTeams.t2)!;

    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-black/95 backdrop-blur-2xl border-b border-white/10 p-3 flex flex-col items-center z-[110] shadow-2xl">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-white/30 text-[9px] font-black tracking-widest uppercase">DESAFIO</span>
            <div className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full text-[9px] font-black border border-red-500/20 uppercase">{currentGame?.name}</div>
          </div>
          {isTimeBased && (
            <div className="bg-white/5 px-8 py-2 rounded-2xl border border-white/5">
              <span className="text-4xl md:text-6xl font-mono font-black text-white tabular-nums tracking-tighter">
                {formatTime(timer)}
              </span>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row relative">
          {[teamA, teamB].map((team, idx) => {
            const stats = duelStats[team.id] || { finished: false, laps: [], numericScore: 0 };
            const isRedSide = idx === 0;
            
            return (
              <div 
                key={team.id} 
                className={`flex-1 flex flex-col items-center justify-start p-8 transition-all duration-700 relative overflow-hidden ${isRedSide ? 'bg-gradient-to-br from-red-700 to-red-900' : 'bg-gradient-to-br from-emerald-800 to-emerald-950'} ${stats.finished && isTimeBased ? 'grayscale-[0.9] brightness-[0.4]' : ''}`}
              >
                {/* Team Label */}
                <div className="mt-8 text-center w-full px-4 z-20">
                  <h3 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tight drop-shadow-lg truncate max-w-full">
                    {team.name}
                  </h3>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/20 backdrop-blur-lg">
                    <span className={`w-1.5 h-1.5 rounded-full ${isRedSide ? 'bg-red-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
                    <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">EQUIPA {idx === 0 ? 'A' : 'B'}</span>
                  </div>
                </div>

                {/* ACTION AREA */}
                <div className="w-full max-w-[280px] md:max-w-xs flex flex-col gap-6 z-20 mt-24">
                  {isTimeBased ? (
                    !stats.finished ? (
                      <button 
                        onClick={() => finishTeam(team.id)}
                        className="group relative bg-white text-slate-900 font-black py-8 md:py-10 rounded-[28px] text-xl md:text-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] active:scale-90 transition-all hover:bg-slate-50 ring-0 hover:ring-8 ring-white/10 uppercase animate-in zoom-in-95 duration-500"
                      >
                        Terminou! ✅
                      </button>
                    ) : (
                      <div className="bg-white/10 border-2 border-white/40 p-6 rounded-[32px] text-center backdrop-blur-3xl animate-in fade-in zoom-in-95 shadow-2xl">
                         <div className="flex flex-col items-center">
                           <span className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">TEMPO FINAL</span>
                           <span className="text-white text-4xl font-black font-mono tracking-tighter drop-shadow-md">
                            {formatTime(stats.laps[0] || 0)}
                           </span>
                           <div className="mt-3 bg-white/20 px-3 py-1 rounded-full text-[9px] text-white font-black uppercase tracking-widest">
                             CONCLUÍDO
                           </div>
                         </div>
                      </div>
                    )
                  ) : (
                    /* Score Entry for points-only games */
                    <div className="bg-white/10 p-8 rounded-[40px] border-2 border-white/20 backdrop-blur-xl flex flex-col items-center shadow-2xl">
                      <label className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-4 text-center">
                        {currentGame?.scoreMetric || "Introduz o Resultado"}
                      </label>
                      <input 
                        type="number"
                        defaultValue={stats.numericScore}
                        onBlur={(e) => updateNumericScore(team.id, e.target.value)}
                        className="bg-white text-slate-900 text-6xl font-black w-full text-center py-4 rounded-3xl outline-none focus:ring-8 ring-white/20"
                        autoFocus={idx === 0}
                      />
                      <div className="mt-4 text-white/30 text-[9px] font-bold">INTRODUZ O VALOR NUMÉRICO</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Controls */}
        <div className="bg-black p-4 flex justify-between items-center gap-4 border-t border-white/10 z-[110]">
          <div className="flex gap-3">
            {isTimeBased && (
              <button 
                onClick={() => setIsRunning(!isRunning)} 
                className="bg-white/5 text-white font-black px-6 py-3 rounded-xl hover:bg-white/10 border border-white/5 transition-all flex items-center gap-2 active:scale-95"
              >
                <span className="text-sm">{isRunning ? '⏸️ PAUSA' : '▶️ RETOMAR'}</span>
              </button>
            )}
            <button 
              onClick={handleCancelDuel} 
              className="text-white/40 font-bold px-4 py-3 hover:text-red-400 transition-colors text-[10px] uppercase tracking-widest"
            >
              Cancelar Duelo
            </button>
          </div>
          
          <button 
            onClick={saveMatch}
            disabled={isTimeBased ? !Object.values(duelStats).some(s => s.finished) : false}
            className="bg-yellow-400 text-yellow-950 font-black px-10 py-3.5 rounded-xl text-base shadow-xl transition-all hover:bg-yellow-300 active:scale-95 disabled:opacity-20 flex items-center gap-2 uppercase tracking-tighter"
          >
            Registar Resultados 💾
          </button>
        </div>
      </div>
    );
  }

  if (view === 'session-summary') {
    const sortedTeamIds = Object.keys(sessionResults).sort((a, b) => {
      if (!isTimeBased) return sessionResults[b].score - sessionResults[a].score;
      return sessionResults[a].time - sessionResults[b].time;
    });
    const count = sortedTeamIds.length;

    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">🏆</div>
          <span className="text-xs font-black text-red-500 uppercase tracking-widest bg-red-50 px-4 py-1.5 rounded-full mb-2 inline-block">Placar do Jogo</span>
          <h2 className="text-4xl font-black text-slate-800 christmas-font mt-2">{currentGame?.name}</h2>
        </div>

        <div className="bg-slate-50 rounded-[48px] p-8 mb-8 border-4 border-white shadow-xl relative overflow-hidden">
          <div className="space-y-4">
            {sortedTeamIds.map((tid, idx) => {
                const team = teams.find(t => t.id === tid);
                const projectedPoints = calculatePointsForIndex(idx, count);
                const resultVal = isTimeBased ? formatTime(sessionResults[tid].time) : sessionResults[tid].score;
                
                return (
                  <div key={tid} className="bg-white p-5 rounded-[28px] flex items-center justify-between shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4 transition-all hover:shadow-md" style={{animationDelay: `${idx * 0.1}s`}}>
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${idx === 0 ? 'bg-yellow-400 text-yellow-900 shadow-yellow-200' : 'bg-slate-100 text-slate-400 shadow-slate-50'}`}>
                        {idx + 1}º
                      </div>
                      <div>
                        <span className="font-black text-slate-800 text-xl block leading-none">{team?.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">EQUIPA</span>
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 rounded-full">+{projectedPoints} PTS</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-2xl text-red-600 block leading-none">{resultVal}</span>
                      <span className="text-[10px] font-bold text-red-400 uppercase mt-1 block tracking-wider">
                        {isTimeBased ? 'TEMPO' : 'PONTOS'}
                      </span>
                    </div>
                  </div>
                );
              })}
            {count === 0 && (
              <div className="py-12 text-center">
                 <div className="text-4xl mb-4 opacity-20">⏱️</div>
                 <p className="text-slate-400 font-bold italic">Nenhum tempo registado nesta sessão.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <button 
            onClick={() => { setMatchTeams({ t1: null, t2: null }); setView('team-match'); }}
            className="flex-1 bg-white border-4 border-slate-100 text-slate-600 font-black py-5 rounded-full text-lg hover:border-red-200 hover:text-red-500 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>➕</span> Novo Duelo
          </button>
          <button 
            onClick={finalizeGameSession}
            disabled={count === 0}
            className="flex-[2] bg-red-600 text-white font-black py-5 rounded-full text-xl shadow-[0_15px_40px_rgba(220,38,38,0.3)] hover:bg-red-700 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
          >
            Confirmar e Pontuar 🏅
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PlayGame;
