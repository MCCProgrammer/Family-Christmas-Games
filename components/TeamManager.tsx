
import React, { useState } from 'react';
import { Member, Team } from '../types';
import { ICONS, COLORS } from '../constants';

interface Props {
  members: Member[];
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
}

const TeamManager: React.FC<Props> = ({ members, teams, setTeams }) => {
  const [teamName, setTeamName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const createTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    const newTeam: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name: teamName.trim(),
      members: [],
      points: 0,
      color: selectedColor
    };
    setTeams([...teams, newTeam]);
    setTeamName('');
    setSelectedColor(COLORS[(teams.length + 1) % COLORS.length]);
  };

  const toggleMemberToTeam = (teamId: string, memberId: string) => {
    setTeams(prev => prev.map(t => {
      // If member is in this team, remove them
      if (t.id === teamId && t.members.includes(memberId)) {
        return { ...t, members: t.members.filter(id => id !== memberId) };
      }
      // If member is being added to this team
      if (t.id === teamId) {
        return { ...t, members: [...t.members, memberId] };
      }
      // Remove member from any other team they might be in
      if (t.members.includes(memberId)) {
        return { ...t, members: t.members.filter(id => id !== memberId) };
      }
      return t;
    }));
  };

  const removeTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id));
  };

  return (
    <div className="p-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-emerald-600 mb-2">Formar Equipas</h2>
        <p className="text-slate-500">Cria as equipas e clica nos membros para as preencher.</p>
      </div>

      <form onSubmit={createTeam} className="bg-emerald-50 p-6 rounded-2xl mb-8 shadow-inner">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full transition-transform ${color} ${
                selectedColor === color ? 'ring-4 ring-emerald-200 scale-125 shadow-md' : ''
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Nome da equipa (ex: Duendes)..."
            className="flex-1 px-4 py-3 rounded-xl border-2 border-emerald-100 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition-colors font-semibold"
          />
          <button
            type="submit"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-bold shadow-md"
          >
            Criar Equipa
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {teams.map(team => (
          <div key={team.id} className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className={`${team.color} p-3 text-white flex justify-between items-center`}>
              <h3 className="font-bold flex items-center gap-2">
                <span className="text-xl">⭐</span> {team.name}
              </h3>
              <button onClick={() => removeTeam(team.id)} className="hover:text-red-200">{ICONS.Trash}</button>
            </div>
            <div className="p-4 flex flex-wrap gap-2 min-h-[60px]">
              {members.map(member => (
                <button
                  key={member.id}
                  onClick={() => toggleMemberToTeam(team.id, member.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    team.members.includes(member.id)
                      ? `${team.color} text-white shadow-sm`
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {member.avatar} {member.name}
                </button>
              ))}
            </div>
            <div className="bg-slate-50 px-4 py-2 text-xs text-slate-400">
              {team.members.length} membros
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12 opacity-30 italic">
          Cria a tua primeira equipa acima!
        </div>
      )}
    </div>
  );
};

export default TeamManager;
