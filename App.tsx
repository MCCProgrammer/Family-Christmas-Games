
import React, { useState, useEffect } from 'react';
import { Member, Team, Game, View, GameHistory } from './types';
import { ICONS, COLORS, CHRISTMAS_AVATARS } from './constants';
import MemberManager from './components/MemberManager';
import TeamManager from './components/TeamManager';
import GameManager from './components/GameManager';
import PlayGame from './components/PlayGame';
import Scoreboard from './components/Scoreboard';
import Podium from './components/Podium';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('setup');
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('christmas-members');
    return saved ? JSON.parse(saved) : [];
  });
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('christmas-teams');
    return saved ? JSON.parse(saved) : [];
  });
  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem('christmas-games');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState<GameHistory[]>(() => {
    const saved = localStorage.getItem('christmas-history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('christmas-members', JSON.stringify(members));
    localStorage.setItem('christmas-teams', JSON.stringify(teams));
    localStorage.setItem('christmas-games', JSON.stringify(games));
    localStorage.setItem('christmas-history', JSON.stringify(history));
  }, [members, teams, games, history]);

  const resetAll = () => {
    if (confirm('Are you sure you want to delete everything and start over?')) {
      setMembers([]);
      setTeams([]);
      setGames([]);
      setHistory([]);
      setActiveView('setup');
    }
  };

  const finalizeGame = (gameId: string, rankings: { teamId: string, points: number, timeSpent?: number }[]) => {
    const newEntries: GameHistory[] = rankings.map(r => ({
      gameId,
      teamId: r.teamId,
      points: r.points,
      timeSpent: r.timeSpent,
      timestamp: Date.now()
    }));

    setHistory([...history, ...newEntries]);
    
    setTeams(prev => prev.map(t => {
      const ranking = rankings.find(r => r.teamId === t.id);
      return ranking ? { ...t, points: t.points + ranking.points } : t;
    }));

    setActiveView('scoreboard');
  };

  const renderView = () => {
    switch (activeView) {
      case 'setup':
        return <MemberManager members={members} setMembers={setMembers} />;
      case 'teams':
        return <TeamManager members={members} teams={teams} setTeams={setTeams} />;
      case 'games':
        return <GameManager games={games} setGames={setGames} members={members} />;
      case 'play':
        return <PlayGame teams={teams} games={games} onFinishGame={finalizeGame} />;
      case 'scoreboard':
        return <Scoreboard teams={teams} history={history} games={games} />;
      case 'podium':
        return <Podium teams={teams} onFinish={() => setActiveView('setup')} />;
      default:
        return <MemberManager members={members} setMembers={setMembers} />;
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-red-600 text-white p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <div className="flex gap-2">
             <div className="animate-bounce">{ICONS.Snowflake}</div>
             <div className="animate-pulse">{ICONS.Gift}</div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎄</span>
            <h1 className="text-3xl md:text-4xl christmas-font font-bold tracking-wider">
              Family Christmas
            </h1>
          </div>
          <button 
            onClick={resetAll}
            className="text-xs bg-red-700 hover:bg-red-800 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
          >
            {ICONS.Trash} Reset all
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 mt-4">
        <div className="bg-white rounded-3xl shadow-xl min-h-[60vh]">
          {renderView()}
        </div>
      </main>

      {/* Persistent Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-red-100 p-2 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-[60]">
        <div className="max-w-4xl mx-auto flex justify-around items-center">
          <NavItem 
            active={activeView === 'setup'} 
            onClick={() => setActiveView('setup')} 
            icon={ICONS.Users} 
            label="Family" 
          />
          <NavItem 
            active={activeView === 'teams'} 
            onClick={() => setActiveView('teams')} 
            icon={ICONS.Star} 
            label="Teams" 
          />
          <NavItem 
            active={activeView === 'games'} 
            onClick={() => setActiveView('games')} 
            icon={ICONS.Gamepad} 
            label="Games" 
          />
          <NavItem 
            active={activeView === 'play'} 
            onClick={() => setActiveView('play')} 
            icon={ICONS.Play} 
            label="Play" 
          />
          <NavItem 
            active={activeView === 'scoreboard'} 
            onClick={() => setActiveView('scoreboard')} 
            icon={ICONS.Trophy} 
            label="Scores" 
          />
          <button 
            onClick={() => setActiveView('podium')}
            className="flex flex-col items-center p-2 rounded-xl bg-yellow-400 text-yellow-900 font-bold transition-transform hover:scale-105 shadow-md"
          >
            <span className="text-xl">🏆</span>
            <span className="text-[10px] uppercase">Final</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
      active ? 'bg-red-100 text-red-600 scale-110 shadow-sm' : 'text-slate-400 hover:text-red-400'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </button>
);

export default App;
