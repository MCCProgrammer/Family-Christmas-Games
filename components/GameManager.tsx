
import React, { useState } from 'react';
import { Game, Member } from '../types';
import { ICONS } from '../constants';

interface Props {
  games: Game[];
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
  members: Member[];
}

const GameManager: React.FC<Props> = ({ games, setGames, members }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<Game['type']>('points-only');
  const [scoreMetric, setScoreMetric] = useState('');

  const addGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newGame: Game = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      description: desc.trim(),
      type,
      scoreMetric: type !== 'time-based' ? scoreMetric.trim() : undefined
    };
    setGames([...games, newGame]);
    setName('');
    setDesc('');
    setScoreMetric('');
  };

  const removeGame = (id: string) => {
    setGames(games.filter(g => g.id !== id));
  };

  return (
    <div className="p-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Christmas games</h2>
        <p className="text-slate-500">Set up the challenges the teams will face.</p>
      </div>

      <form onSubmit={addGame} className="bg-red-50 p-6 rounded-2xl mb-8 flex flex-col gap-4 shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Game name..."
            className="px-4 py-3 rounded-xl border-2 border-red-100 bg-white text-slate-900 placeholder-slate-400 focus:border-red-400 focus:outline-none transition-colors font-semibold"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Game['type'])}
            className="px-4 py-3 rounded-xl border-2 border-red-100 bg-white text-slate-900 focus:border-red-400 focus:outline-none transition-colors font-semibold"
          >
            <option value="points-only">Points (highest wins)</option>
            <option value="time-based">Time (fastest wins)</option>
          </select>
        </div>
        
        {type === 'points-only' && (
          <input
            type="text"
            value={scoreMetric}
            onChange={(e) => setScoreMetric(e.target.value)}
            placeholder="What do you count? (e.g. Baubles caught)"
            className="px-4 py-3 rounded-xl border-2 border-red-100 bg-white text-slate-900 placeholder-slate-400 focus:border-red-400 focus:outline-none transition-colors font-semibold"
          />
        )}

        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description and rules..."
          className="px-4 py-3 rounded-xl border-2 border-red-100 bg-white text-slate-900 placeholder-slate-400 focus:border-red-400 focus:outline-none transition-colors font-semibold"
          rows={2}
        />
        <button
          type="submit"
          className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-bold shadow-md"
        >
          Add game
        </button>
      </form>

      <div className="space-y-4">
        {games.map(game => (
          <div key={game.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {game.type}
                </span>
                <h3 className="font-bold text-slate-800">{game.name}</h3>
              </div>
              <p className="text-sm text-slate-500 line-clamp-1">{game.description}</p>
              {game.scoreMetric && (
                <p className="text-[10px] text-blue-500 font-bold uppercase mt-1">Counting: {game.scoreMetric}</p>
              )}
            </div>
            <button onClick={() => removeGame(game.id)} className="text-slate-300 hover:text-red-500 ml-4">
              {ICONS.Trash}
            </button>
          </div>
        ))}
      </div>

      {games.length === 0 && (
        <div className="text-center py-12 opacity-30 italic">
          No games yet. Add the first challenge above!
        </div>
      )}
    </div>
  );
};

export default GameManager;
