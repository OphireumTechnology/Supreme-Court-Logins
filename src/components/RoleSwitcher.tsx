import React from 'react';
import { UserRole, UserProfile } from '../types';
import { Shield, UserCheck, Scale, Briefcase, Lock } from 'lucide-react';

interface RoleSwitcherProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentUser, allUsers, onSelectUser }) => {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ENP':
        return { label: 'Electronic Notary Public (Rule VI)', color: 'bg-emerald-900/30 text-emerald-300 border-emerald-500/40', icon: Scale };
      case 'LAWYER':
        return { label: 'Lead Legal Counsel', color: 'bg-indigo-900/30 text-indigo-300 border-indigo-500/40', icon: Briefcase };
      case 'CLIENT':
        return { label: 'Litigant / Client', color: 'bg-amber-900/30 text-amber-300 border-amber-500/40', icon: UserCheck };
      case 'ADMIN':
        return { label: 'Supreme Court Admin', color: 'bg-rose-900/30 text-rose-300 border-rose-500/40', icon: Shield };
      case 'COMPLIANCE_OFFICER':
        return { label: 'HIPAA/GDPR Compliance Auditor', color: 'bg-cyan-900/30 text-cyan-300 border-cyan-500/40', icon: Lock };
      default:
        return { label: role, color: 'bg-slate-800 text-slate-300 border-slate-700', icon: Shield };
    }
  };

  const badge = getRoleBadge(currentUser.role);
  const IconComponent = badge.icon;

  return (
    <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 shadow-inner">
      <div className="flex items-center gap-2 pr-2 border-r border-slate-700/80">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <IconComponent className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <span>ACTIVE ROLE:</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${badge.color}`}>
              {currentUser.role}
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-100 leading-tight">
            {currentUser.fullName}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mr-1">Switch Persona:</span>
        {allUsers.map((u) => {
          const isSelected = u.id === currentUser.id;
          return (
            <button
              key={u.id}
              onClick={() => onSelectUser(u)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40 border border-amber-500'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <span>{u.role === 'ENP' ? '⚖️' : u.role === 'LAWYER' ? '📜' : u.role === 'ADMIN' ? '🛡️' : u.role === 'COMPLIANCE_OFFICER' ? '🔒' : '👤'}</span>
              <span>{u.role}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
