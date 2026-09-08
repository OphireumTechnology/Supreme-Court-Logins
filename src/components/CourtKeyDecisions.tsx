import React, { useState } from 'react';
import { 
  CourtKeyDecision, 
  LegalCase, 
  UserProfile 
} from '../types';
import { 
  Key, 
  Scale, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Lock, 
  Unlock, 
  FileText,
  Building,
  UserCheck
} from 'lucide-react';
import { syncHash } from '../utils/crypto';

interface CourtKeyDecisionsProps {
  decisions: CourtKeyDecision[];
  cases: LegalCase[];
  currentUser: UserProfile;
  onApproveDecision: (decisionId: string) => void;
  onNewPetition: (petitionData: Omit<CourtKeyDecision, 'id' | 'status' | 'keyFingerprint'>) => void;
  onTriggerMfa: (actionTitle: string, onSuccess: () => void) => void;
}

export const CourtKeyDecisions: React.FC<CourtKeyDecisionsProps> = ({
  decisions,
  cases,
  currentUser,
  onApproveDecision,
  onNewPetition,
  onTriggerMfa
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedGr, setSelectedGr] = useState(cases[0]?.grNumber || '');
  const [approvingBody, setApprovingBody] = useState<'Supreme Court En Banc' | 'Supreme Court First Division' | 'Supreme Court Second Division' | 'Executive Judge Resolution'>('Supreme Court En Banc');
  const [ponenteJustice, setPonenteJustice] = useState('Chief Justice Alexander G. Gesmundo');
  const [justification, setJustification] = useState('');
  const [authorizedParty, setAuthorizedParty] = useState(currentUser.fullName);

  const handleCreatePetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) return;

    const matchedCase = cases.find(c => c.grNumber === selectedGr);

    onNewPetition({
      grNumber: selectedGr,
      caseTitle: matchedCase ? matchedCase.title : 'Judicial Matter',
      resolutionNumber: `Res. Pet-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      approvingBody,
      ponenteJustice,
      decisionDate: new Date().toISOString().slice(0, 10),
      authorizedParty: authorizedParty || currentUser.fullName,
      justification: justification.trim(),
      validityExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    });

    setShowNewModal(false);
    setJustification('');
  };

  const handleApproveWithMfa = (decision: CourtKeyDecision) => {
    onTriggerMfa(
      `Issue Court Decision to Grant Private Keys for ${decision.grNumber} (${decision.resolutionNumber})`,
      () => {
        onApproveDecision(decision.id);
      }
    );
  };

  const canApprove = currentUser.role === 'ADMIN' || currentUser.role === 'COMPLIANCE_OFFICER';

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
            <Key className="w-4 h-4" />
            <span>JUDICIAL DECRYPTION PROTOCOL &bull; A.M. NO. 24-10-14-SC</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 font-serif">
            Court Private Key Decisions &amp; Multi-Storage Approvals
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Sealed multi-storage documents can strictly never be unlocked without the digital private keys authorized by the approving judicial body (Supreme Court En Banc or Division). Every decision is recorded with its G.R. number for full legal traceability.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-900/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Petition for Private Key Issuance</span>
        </button>
      </div>

      {/* Decisions List */}
      <div className="space-y-3">
        {decisions.map((decision) => {
          const isApproved = decision.status === 'APPROVED';
          return (
            <div
              key={decision.id}
              className={`bg-slate-900/90 border rounded-2xl p-5 shadow-sm space-y-3 transition-all ${
                isApproved
                  ? 'border-emerald-500/30 hover:border-emerald-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-amber-400 text-sm bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-lg">
                    {decision.grNumber}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    {decision.resolutionNumber}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {decision.approvingBody}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 ${
                    isApproved
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                  }`}>
                    {isApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-amber-400" />}
                    {decision.status}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-100 font-serif">{decision.caseTitle}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  <strong>Ponente Justice:</strong> {decision.ponenteJustice} &bull; <strong>Decision Date:</strong> {decision.decisionDate} &bull; <strong>Expiry:</strong> {decision.validityExpiry}
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400 font-medium">Judicial Legal Ground / Justification:</div>
                <div className="text-slate-300 italic">{decision.justification}</div>
                <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
                  <span><strong>Authorized Recipient:</strong> {decision.authorizedParty}</span>
                  <span className="font-mono text-cyan-400">Key Fingerprint: {decision.keyFingerprint}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60">
                <div className="text-[11px] text-slate-500 font-mono">
                  Blockchain Immutability Lock: {syncHash(decision.id + decision.grNumber)}
                </div>

                {!isApproved ? (
                  canApprove ? (
                    <button
                      onClick={() => handleApproveWithMfa(decision)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Issue Decision &amp; Release Private Key (MFA Required)</span>
                    </button>
                  ) : (
                    <div className="text-xs text-slate-400 italic flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Pending action by En Banc / Division Clerk of Court (Switch to ADMIN to approve)</span>
                    </div>
                  )
                ) : (
                  <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 font-mono">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Private Key Active &bull; Multi-Storage Decryption Authorized</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Petition Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">Petition for Court Key Decision</h3>
              </div>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreatePetition} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Target Supreme Court G.R. Filing:
                </label>
                <select
                  value={selectedGr}
                  onChange={(e) => setSelectedGr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.grNumber}>
                      {c.grNumber} - {c.title.slice(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Approving Court Body:
                </label>
                <select
                  value={approvingBody}
                  onChange={(e) => setApprovingBody(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="Supreme Court En Banc">Supreme Court En Banc</option>
                  <option value="Supreme Court First Division">Supreme Court First Division</option>
                  <option value="Supreme Court Second Division">Supreme Court Second Division</option>
                  <option value="Executive Judge Resolution">Executive Judge Resolution</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Ponente / Presiding Justice:
                </label>
                <input
                  type="text"
                  value={ponenteJustice}
                  onChange={(e) => setPonenteJustice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Authorized Legal Counsel / Litigant:
                </label>
                <input
                  type="text"
                  value={authorizedParty}
                  onChange={(e) => setAuthorizedParty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Legal Justification &amp; Authority for Decryption:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the legal necessity under Rules of Court for unlocking the confidential multi-storage files..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-900/40"
                >
                  File Urgent Petition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
