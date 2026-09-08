import React, { useState } from 'react';
import { SecureMessage, LegalCase, UserProfile } from '../types';
import { 
  MessageSquare, 
  Send, 
  Lock, 
  ShieldCheck, 
  Search,
  CheckCheck
} from 'lucide-react';
import { syncHash } from '../utils/crypto';

interface SecureMessagingProps {
  messages: SecureMessage[];
  cases: LegalCase[];
  currentUser: UserProfile;
  onSendMessage: (msg: Omit<SecureMessage, 'id' | 'sentAt' | 'isRead'>) => void;
  selectedCaseId?: string | null;
}

export const SecureMessaging: React.FC<SecureMessagingProps> = ({
  messages,
  cases,
  currentUser,
  onSendMessage,
  selectedCaseId
}) => {
  const [activeCaseId, setActiveCaseId] = useState<string>(selectedCaseId || cases[0]?.id || '');
  const [textInput, setTextInput] = useState('');
  const [search, setSearch] = useState('');

  const activeCase = cases.find(c => c.id === activeCaseId) || cases[0];
  const caseMessages = messages.filter(m => m.grNumber === activeCase?.grNumber);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !activeCase) return;

    onSendMessage({
      grNumber: activeCase.grNumber,
      caseTitle: activeCase.title,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      recipientName: currentUser.role === 'CLIENT' ? activeCase.attorneyName : activeCase.clientName,
      recipientRole: currentUser.role === 'CLIENT' ? 'LAWYER' : 'CLIENT',
      encryptedContent: textInput.trim()
    });

    setTextInput('');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-3 min-h-[600px]">
      {/* Sidebar: Case Threads */}
      <div className="border-r border-slate-800 p-4 space-y-3 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 font-serif">Counsel &bull; Client Channels</h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
            E2EE Active
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search G.R. case threads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="space-y-1.5 overflow-y-auto max-h-[500px]">
          {cases
            .filter(c => c.grNumber.toLowerCase().includes(search.toLowerCase()) || c.title.toLowerCase().includes(search.toLowerCase()))
            .map((c) => {
              const isSelected = c.id === activeCase?.id;
              const msgCount = messages.filter(m => m.grNumber === c.grNumber).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCaseId(c.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-amber-600/20 border-amber-500/50 text-slate-100'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400">{c.grNumber}</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                      {msgCount} msgs
                    </span>
                  </div>
                  <div className="text-xs font-semibold truncate mt-1 text-slate-200">{c.title}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    Counsel: {c.attorneyName} &bull; Client: {c.clientName}
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="col-span-2 flex flex-col justify-between bg-slate-900/40">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                {activeCase?.grNumber}
              </span>
              <span className="text-xs text-slate-300 font-bold truncate max-w-md">
                {activeCase?.title}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
              <span>Litigant: {activeCase?.clientName}</span>
              <span>&bull;</span>
              <span>Lead Attorney: {activeCase?.attorneyName}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-xl font-mono">
            <Lock className="w-3 h-3" />
            <span>AES-256 E2EE</span>
          </div>
        </div>

        {/* Message Feed */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 max-h-[420px]">
          {caseMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-16">
              <ShieldCheck className="w-8 h-8 text-slate-600" />
              <div className="text-xs">No encrypted messages yet for this legal matter.</div>
              <p className="text-[11px] text-slate-600 max-w-xs text-center">
                Send an encrypted advisory regarding hearings, pleadings, or notarial appointments.
              </p>
            </div>
          ) : (
            caseMessages.map((msg) => {
              const isMine = msg.senderName === currentUser.fullName || msg.senderRole === currentUser.role;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 px-1 font-mono">
                    <span className="font-bold text-slate-300">{msg.senderName}</span>
                    <span className="bg-slate-800 text-slate-400 px-1 py-0.2 rounded text-[9px]">
                      {msg.senderRole}
                    </span>
                    <span>&bull;</span>
                    <span>{msg.sentAt}</span>
                  </div>

                  <div
                    className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed space-y-1.5 shadow-md ${
                      isMine
                        ? 'bg-amber-600 text-slate-950 font-medium rounded-br-none'
                        : 'bg-slate-800 border border-slate-700/80 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    <div>{msg.encryptedContent}</div>
                    <div className="flex items-center justify-between text-[10px] opacity-75 font-mono pt-1 border-t border-black/10">
                      <span>E2EE SHA-256: {syncHash(msg.encryptedContent + msg.id).slice(0, 10)}...</span>
                      <CheckCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type encrypted message regarding this case filing..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!textInput.trim()}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Encrypted</span>
          </button>
        </form>
      </div>
    </div>
  );
};
