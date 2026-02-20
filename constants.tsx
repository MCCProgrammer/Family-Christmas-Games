
import React from 'react';
import { 
  Users, 
  Trophy, 
  Gamepad2, 
  PlayCircle, 
  LayoutDashboard, 
  Gift, 
  Snowflake, 
  Music,
  UserPlus,
  Trash2,
  Clock,
  Star
} from 'lucide-react';

export const COLORS = [
  'bg-red-500', 'bg-green-600', 'bg-blue-500', 'bg-yellow-500', 
  'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-emerald-500'
];

export const ICONS = {
  Users: <Users className="w-5 h-5" />,
  Trophy: <Trophy className="w-5 h-5" />,
  Gamepad: <Gamepad2 className="w-5 h-5" />,
  Play: <PlayCircle className="w-5 h-5" />,
  Dashboard: <LayoutDashboard className="w-5 h-5" />,
  Gift: <Gift className="w-5 h-5" />,
  Snowflake: <Snowflake className="w-5 h-5" />,
  Music: <Music className="w-5 h-5" />,
  UserPlus: <UserPlus className="w-5 h-5" />,
  Trash: <Trash2 className="w-4 h-4" />,
  Clock: <Clock className="w-5 h-5" />,
  Star: <Star className="w-5 h-5" />
};

export const CHRISTMAS_AVATARS = [
  '🎅', '🤶', '🎄', '🎁', '⛄', '🦌', '🔔', '🍪', '🥛', '🕯️', '🐧', '❄️'
];
