
import React, { useState } from 'react';
import { Member } from '../types';
import { ICONS, CHRISTMAS_AVATARS } from '../constants';

interface Props {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}

const MemberManager: React.FC<Props> = ({ members, setMembers }) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(CHRISTMAS_AVATARS[0]);

  const addMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newMember: Member = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      avatar: selectedAvatar
    };
    setMembers([...members, newMember]);
    setName('');
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  return (
    <div className="p-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Quem vai jogar?</h2>
        <p className="text-slate-500">Adiciona todos os membros da família que vão participar.</p>
      </div>

      <form onSubmit={addMember} className="bg-red-50 p-6 rounded-2xl mb-8 flex flex-col gap-4 shadow-inner">
        <div className="flex flex-wrap justify-center gap-3 mb-2">
          {CHRISTMAS_AVATARS.map(avatar => (
            <button
              key={avatar}
              type="button"
              onClick={() => setSelectedAvatar(avatar)}
              className={`text-2xl w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                selectedAvatar === avatar ? 'bg-red-500 scale-125 shadow-md text-white' : 'bg-white hover:bg-red-100'
              }`}
            >
              {avatar}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do membro..."
            className="flex-1 px-4 py-3 rounded-xl border-2 border-red-100 bg-white text-slate-900 placeholder-slate-400 focus:border-red-400 focus:outline-none transition-colors font-semibold"
          />
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 font-bold shadow-md"
          >
            {ICONS.UserPlus} Adicionar
          </button>
        </div>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {members.map(member => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm group animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{member.avatar}</span>
              <span className="font-semibold text-slate-700">{member.name}</span>
            </div>
            <button 
              onClick={() => removeMember(member.id)}
              className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {ICONS.Trash}
            </button>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-12 opacity-30 italic">
          Ninguém adicionado ainda... Começa a festa!
        </div>
      )}
    </div>
  );
};

export default MemberManager;
