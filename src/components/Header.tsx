import React, { useState } from 'react';
import { 
  Scale, 
  Shield, 
  FileText, 
  Key, 
  MessageSquare, 
  Bell, 
  Search, 
  Lock, 
  CheckCircle2, 
  Menu, 
  X,
  BookOpen,
  Activity,
  Clock,
  Briefcase
} from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import { UserProfile } from '../types';

export type ActiveTab = 
  | 'CASES' 
  | 'ENP_QUEUE'
  | 'CLIENT_TIMELINE'
  | 'NOTARIZATION' 
  | 'NOTARIAL_BOOK'
  | 'COURT_KEYS' 
  | 'MESSAGING' 
  | 'AUDIT_SECURITY' 
  | 'NOTIFICATIONS' 
  | 'PROVIDER_HEALTH'
  | 'VERIFICATION';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  unreadMessagesCount: number;
  activeAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  allUsers,
  onSelectUser,
  unreadMessagesCount,
  activeAlertsCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; alert?: boolean }[] = [
    { id: 'CASES', label: 'Cases (G.R. Track)', icon: FileText },
    { id: 'ENP_QUEUE', label: 'ENP Work Queue', icon: Briefcase },
    { id: 'CLIENT_TIMELINE', label: 'Timeline & States', icon: Clock },
    { id: 'NOTARIZATION', label: 'E-Notary (IEN/REN)', icon: Scale },
    { id: 'NOTARIAL_BOOK', label: 'Notarial Book', icon: BookOpen },
    { id: 'COURT_KEYS', label: 'Court Key Dec.', icon: Key },
    { id: 'MESSAGING', label: 'Encrypted Chat', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'AUDIT_SECURITY', label: 'Security & Audit', icon: Shield, badge: activeAlertsCount, alert: activeAlertsCount > 0 },
    { id: 'NOTIFICATIONS', label: 'SMS/Email Alerts', icon: Bell },
    { id: 'PROVIDER_HEALTH', label: 'Provider Gateway', icon: Activity },
    { id: 'VERIFICATION', label: 'Public Verification', icon: Search }
  ];

  return (
    <header className="bg-slate-950/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      {/* Top Judicial Header Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80 px-4 py-2 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold text-slate-200">SUPREME COURT OF THE PHILIPPINES &bull; ENF PLATFORM</span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-amber-400 font-mono">A.M. No. 24-10-14-SC EN BANC</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              <Lock className="w-3 h-3" /> AES-256 GCM
            </span>
            <span className="hidden sm:inline text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
              HIPAA &amp; GDPR
            </span>
            <span className="text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Rule VIII Ledger
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('CASES')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-900/30 border border-amber-400/40">
              <Scale className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white font-serif">
                  LEX NOTARIA <span className="text-amber-400">SUPREMA</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded">
                  ENF 2025
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Electronic Notarization Facility &amp; Judicial Case Tracking System
              </p>
            </div>
          </div>

          {/* Persona Role Switcher Desktop */}
          <div className="hidden lg:block">
            <RoleSwitcher 
              currentUser={currentUser} 
              allUsers={allUsers} 
              onSelectUser={onSelectUser} 
            />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Persona Switcher Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 space-y-3 animate-in fade-in duration-150">
            <RoleSwitcher 
              currentUser={currentUser} 
              allUsers={allUsers} 
              onSelectUser={(u) => { onSelectUser(u); setMobileMenuOpen(false); }} 
            />
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="mt-3 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800/80 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30 border border-amber-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    item.alert ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-400 text-slate-950'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
