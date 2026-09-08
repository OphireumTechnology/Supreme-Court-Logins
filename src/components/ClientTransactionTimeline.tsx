import React, { useState, useEffect } from 'react';
import {
  FileText,
  UserCheck,
  Globe,
  MapPin,
  Scale,
  Calendar,
  Video,
  PenTool,
  Stamp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Shield,
  Upload,
  RefreshCw,
  Eye,
  Lock,
  ExternalLink
} from 'lucide-react';
import { EnfTransaction, EnfTransactionState, TransactionParticipant } from '../types/enf';
import { UserProfile } from '../types';
import { ClientIdentityModal } from './ClientIdentityModal';

interface ClientTransactionTimelineProps {
  currentUser: UserProfile;
}

const STAGES = [
  { id: 1, label: 'Document Upload & Validation', icon: FileText, requiredState: 'DOCUMENT_VALIDATED' },
  { id: 2, label: 'Identity Verification (PhilSys)', icon: UserCheck, requiredState: 'SERVICE_MODE_SELECTED' },
  { id: 3, label: 'Notarization Mode (IEN / REN)', icon: Globe, requiredState: 'SERVICE_MODE_SELECTED' },
  { id: 4, label: 'Territorial Jurisdiction Check', icon: MapPin, requiredState: 'ENP_ASSIGNED' },
  { id: 5, label: 'Commissioned ENP Assignment', icon: Scale, requiredState: 'ENP_ASSIGNED' },
  { id: 6, label: 'Appointment Scheduling', icon: Calendar, requiredState: 'APPEARANCE_SCHEDULED' },
  { id: 7, label: 'Synchronous Appearance Session', icon: Video, requiredState: 'APPEARANCE_SESSION' },
  { id: 8, label: 'Participant Electronic Signing', icon: PenTool, requiredState: 'PARTICIPANT_SIGNING' },
  { id: 9, label: 'ENP Notarization (Sig & Seal)', icon: Stamp, requiredState: 'CERTIFICATE_ISSUED' },
  { id: 10, label: 'Completion & 10-Yr Sealed Vault', icon: CheckCircle2, requiredState: 'COMPLETE' }
];

export const ClientTransactionTimeline: React.FC<ClientTransactionTimelineProps> = ({ currentUser }) => {
  const [transactions, setTransactions] = useState<EnfTransaction[]>([]);
  const [selectedTxId, setSelectedTxId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [identityModalOpen, setIdentityModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<TransactionParticipant | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/v1/transactions', {
        headers: {
          'x-tenant-id': currentUser.tenantId || 'tenant_sc_ph',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        }
      });
      if (res.ok) {
        const data: EnfTransaction[] = await res.json();
        setTransactions(data);
        if (data.length > 0 && !selectedTxId) {
          setSelectedTxId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentUser]);

  const activeTx = transactions.find(t => t.id === selectedTxId) || transactions[0];

  const handleOpenIdentity = (participant: TransactionParticipant) => {
    setSelectedParticipant(participant);
    setIdentityModalOpen(true);
  };

  const handleIdentitySuccess = (res: any) => {
    setActionFeedback('Identity successfully verified through PhilSys eVerify sandbox gateway.');
    fetchTransactions();
  };

  // Determine stage completion index
  const getStageIndex = (state: EnfTransactionState): number => {
    switch (state) {
      case 'CREATED':
        return 0;
      case 'DOCUMENT_UPLOADED':
      case 'DOCUMENT_VALIDATED':
        return 1;
      case 'PARTICIPANTS_INVITED':
      case 'IDENTITY_VERIFICATION':
      case 'IDENTITY_REVIEW_REQUIRED':
        return 1;
      case 'SERVICE_MODE_SELECTED':
        return 3;
      case 'JURISDICTION_CHECK':
      case 'JURISDICTION_REVIEW_REQUIRED':
        return 3;
      case 'ENP_ASSIGNED':
        return 4;
      case 'APPEARANCE_SCHEDULED':
        return 5;
      case 'APPEARANCE_SESSION':
      case 'NOTARIAL_ACT_CLASSIFIED':
        return 6;
      case 'READY_FOR_SIGNING':
      case 'PARTICIPANT_SIGNING':
        return 7;
      case 'ENP_SIGNATURE_APPLIED':
      case 'ENP_SEAL_APPLIED':
      case 'CERTIFICATE_ISSUED':
      case 'NOTARIAL_BOOK_RECORDED':
        return 8;
      case 'EVIDENCE_SEALED':
      case 'PAYMENT_SETTLED':
      case 'REGULATORY_SYNC_PENDING':
      case 'REGULATORY_SYNC_COMPLETED':
      case 'COMPLETE':
        return 9;
      default:
        return 0;
    }
  };

  const currentStageIndex = activeTx ? getStageIndex(activeTx.state) : 0;

  return (
    <div className="space-y-6">
      {/* Top Selector & Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
              Client Legal Workspace
            </span>
            <span className="text-xs text-slate-400">A.M. No. 24-10-14-SC Transaction Lifecycle</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Electronic Notarization Timeline</h2>
          <p className="text-xs text-slate-400">
            Regulated state machine tracking: every transition requires authoritative server-side execution.
          </p>
        </div>

        {/* Transaction Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedTxId}
            onChange={e => setSelectedTxId(e.target.value)}
            className="py-2 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono focus:ring-1 focus:ring-amber-500"
          >
            {transactions.map(t => (
              <option key={t.id} value={t.id}>
                {t.grNumber} - {t.documentTitle.slice(0, 24)}... ({t.state})
              </option>
            ))}
          </select>
          <button
            onClick={fetchTransactions}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Refresh Transactions"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-400 hover:text-emerald-200">
            &times;
          </button>
        </div>
      )}

      {activeTx && (
        <>
          {/* Active State Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-amber-400 font-bold">{activeTx.grNumber}</span>
                <h3 className="text-base font-bold text-slate-100">{activeTx.documentTitle}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  STATE: {activeTx.state}
                </span>
                <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-300">
                  {activeTx.serviceMode} Mode
                </span>
              </div>
            </div>

            {/* 10-Stage Progression Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {STAGES.map((st, idx) => {
                const isPassed = currentStageIndex > idx || activeTx.state === 'COMPLETE';
                const isCurrent = currentStageIndex === idx && activeTx.state !== 'COMPLETE';
                const Icon = st.icon;

                return (
                  <div
                    key={st.id}
                    className={`p-2.5 rounded-lg border text-center flex flex-col items-center justify-between min-h-[90px] transition-colors ${
                      isPassed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : isCurrent
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold shadow-lg shadow-amber-500/5'
                        : 'bg-slate-950 border-slate-800/80 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full text-[10px] font-mono">
                      <span>0{st.id}</span>
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : isCurrent ? (
                        <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      )}
                    </div>
                    <Icon className="w-4 h-4 my-1" />
                    <span className="text-[10px] leading-tight line-clamp-2">{st.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Callout Based on Current State */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Required Next Action</h4>

            {activeTx.state === 'IDENTITY_VERIFICATION' || activeTx.state === 'CREATED' || activeTx.state === 'DOCUMENT_VALIDATED' || activeTx.participants.some(p => p.identityStatus !== 'VERIFIED') ? (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-amber-300">Identity Verification Required</div>
                  <p className="text-xs text-slate-300">
                    Rule VII requires competent evidence of identity verified through government database gateways.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenIdentity(activeTx.participants[0])}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Start PhilSys e-KYC (6-Step)</span>
                </button>
              </div>
            ) : activeTx.state === 'JURISDICTION_REVIEW_REQUIRED' ? (
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-3">
                <Globe className="w-5 h-5 shrink-0" />
                <span>
                  Territorial presence requires confirmation by Commissioned ENP prior to scheduling appearance.
                </span>
              </div>
            ) : activeTx.state === 'READY_FOR_SIGNING' || activeTx.state === 'PARTICIPANT_SIGNING' ? (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-emerald-300">Appearance Completed — Document Ready for Signing</div>
                  <p className="text-xs text-slate-300">
                    Signatory identity and voluntariness confirmed. Participant signature will generate Version 4.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const res = await fetch(`/v1/transactions/${activeTx.id}/sign`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        participantId: activeTx.participants[0].id,
                        signatureHex: 'PARTICIPANT_SIGNATURE_DATA_DIGITAL'
                      })
                    });
                    if (res.ok) {
                      setActionFeedback('Participant signature successfully recorded!');
                      fetchTransactions();
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Apply Signatory Signature</span>
                </button>
              </div>
            ) : activeTx.state === 'COMPLETE' ? (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-emerald-300">Official Notarial Certificate Issued</div>
                  <p className="text-xs text-slate-300 font-mono">
                    Certificate #: {activeTx.certificateRecord?.certificateNumber || 'CERT-SC-2025-00891'}
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  10-Year Vault Sealed
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-800 text-xs text-slate-400">
                Awaiting commissioned ENP action in judicial work queue (Current state: <strong>{activeTx.state}</strong>).
              </div>
            )}
          </div>

          {/* Signatories and Documents Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Participants */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Transaction Signatories</h4>
              <div className="space-y-2">
                {activeTx.participants.map(p => (
                  <div key={p.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{p.fullName}</div>
                      <div className="text-[11px] text-slate-400">{p.email} | {p.role}</div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.identityStatus === 'VERIFIED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {p.identityStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Immutable Document Versions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Immutable Document Chain</h4>
              <div className="space-y-2">
                {activeTx.documentVersions.map(v => (
                  <div key={v.documentVersionId} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-200">{v.versionStage}</div>
                      <div className="font-mono text-[10px] text-slate-500 truncate max-w-[200px]">SHA-256: {v.contentHash}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      v{v.versionNumber}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Identity Verification Modal */}
      {identityModalOpen && selectedParticipant && activeTx && (
        <ClientIdentityModal
          isOpen={identityModalOpen}
          onClose={() => setIdentityModalOpen(false)}
          transaction={activeTx}
          participant={selectedParticipant}
          onVerificationSuccess={handleIdentitySuccess}
        />
      )}
    </div>
  );
};
