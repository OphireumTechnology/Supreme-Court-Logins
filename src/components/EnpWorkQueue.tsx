import React, { useState, useEffect } from 'react';
import {
  Scale,
  Shield,
  FileText,
  UserCheck,
  Globe,
  Calendar,
  Video,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Stamp,
  Key,
  DollarSign,
  Search,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import { EnfTransaction, EnfTransactionState, NotarialActType } from '../types/enf';
import { UserProfile } from '../types';

interface EnpWorkQueueProps {
  currentUser: UserProfile;
  onSelectTransaction?: (tx: EnfTransaction) => void;
  onRefreshTrigger?: () => void;
}

type WorkQueueTab =
  | 'AWAITING_REVIEW'
  | 'IDENTITY_REVIEW'
  | 'JURISDICTION_REVIEW'
  | 'UPCOMING_IEN'
  | 'UPCOMING_REN'
  | 'ACT_CLASSIFICATION'
  | 'READY_FOR_SIGNING'
  | 'CERTIFICATE_PENDING'
  | 'BOOK_ENTRY_PENDING'
  | 'REGULATORY_SYNC_PENDING'
  | 'COMPLETED';

export const EnpWorkQueue: React.FC<EnpWorkQueueProps> = ({ currentUser, onSelectTransaction }) => {
  const [activeBucket, setActiveBucket] = useState<WorkQueueTab>('READY_FOR_SIGNING');
  const [transactions, setTransactions] = useState<EnfTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<EnfTransaction | null>(null);
  const [actionDrawerOpen, setActionDrawerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load Transactions from REST API
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/v1/transactions', {
        headers: {
          'x-tenant-id': currentUser.tenantId || 'tenant_sc_ph',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role,
          'x-enp-status': 'ACTIVE'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentUser]);

  // Group into 11 statutory buckets (Mandate 32)
  const buckets: Record<WorkQueueTab, EnfTransaction[]> = {
    AWAITING_REVIEW: transactions.filter(t => t.state === 'DOCUMENT_UPLOADED' || t.state === 'DOCUMENT_VALIDATED'),
    IDENTITY_REVIEW: transactions.filter(t => t.state === 'IDENTITY_REVIEW_REQUIRED' || t.participants.some(p => p.identityStatus === 'REVIEW_REQUIRED')),
    JURISDICTION_REVIEW: transactions.filter(t => t.state === 'JURISDICTION_REVIEW_REQUIRED' || t.jurisdictionStatus === 'REVIEW_REQUIRED'),
    UPCOMING_IEN: transactions.filter(t => t.serviceMode === 'IEN' && (t.state === 'APPEARANCE_SCHEDULED' || t.state === 'APPEARANCE_SESSION')),
    UPCOMING_REN: transactions.filter(t => t.serviceMode === 'REN' && (t.state === 'APPEARANCE_SCHEDULED' || t.state === 'APPEARANCE_SESSION')),
    ACT_CLASSIFICATION: transactions.filter(t => t.state === 'APPEARANCE_SESSION' || (t.state === 'NOTARIAL_ACT_CLASSIFIED' && !t.actType)),
    READY_FOR_SIGNING: transactions.filter(t => t.state === 'READY_FOR_SIGNING' || t.state === 'PARTICIPANT_SIGNING'),
    CERTIFICATE_PENDING: transactions.filter(t => t.state === 'ENP_SIGNATURE_APPLIED' || t.state === 'ENP_SEAL_APPLIED'),
    BOOK_ENTRY_PENDING: transactions.filter(t => t.state === 'CERTIFICATE_ISSUED'),
    REGULATORY_SYNC_PENDING: transactions.filter(t => ['NOTARIAL_BOOK_RECORDED', 'EVIDENCE_SEALED', 'PAYMENT_SETTLED', 'REGULATORY_SYNC_PENDING'].includes(t.state)),
    COMPLETED: transactions.filter(t => t.state === 'COMPLETE' || t.state === 'REGULATORY_SYNC_COMPLETED')
  };

  const tabsConfig: { id: WorkQueueTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'AWAITING_REVIEW', label: '1. Awaiting Review', icon: FileText },
    { id: 'IDENTITY_REVIEW', label: '2. Identity Review', icon: UserCheck },
    { id: 'JURISDICTION_REVIEW', label: '3. Jurisdiction Review', icon: Globe },
    { id: 'UPCOMING_IEN', label: '4. Upcoming IEN', icon: Calendar },
    { id: 'UPCOMING_REN', label: '5. Upcoming REN', icon: Video },
    { id: 'ACT_CLASSIFICATION', label: '6. Act Classification', icon: Scale },
    { id: 'READY_FOR_SIGNING', label: '7. Ready for Signature', icon: Key },
    { id: 'CERTIFICATE_PENDING', label: '8. Cert Pending', icon: Stamp },
    { id: 'BOOK_ENTRY_PENDING', label: '9. Book Entry Pending', icon: BookOpen },
    { id: 'REGULATORY_SYNC_PENDING', label: '10. Regulatory Sync', icon: Send },
    { id: 'COMPLETED', label: '11. Completed', icon: CheckCircle2 }
  ];

  const handleOpenAction = (tx: EnfTransaction) => {
    setSelectedTx(tx);
    setActionDrawerOpen(true);
    setFeedbackMsg(null);
  };

  // Execution Handlers for ENP
  const handleExecuteCommand = async (endpoint: string, bodyData: any = {}) => {
    if (!selectedTx) return;
    setIsProcessing(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch(`/v1/transactions/${selectedTx.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': currentUser.tenantId || 'tenant_sc_ph',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role,
          'x-mfa-verified': 'true',
          'x-enp-status': 'ACTIVE'
        },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');

      setFeedbackMsg({ type: 'success', text: `Operation succeeded! Transitioned to state: ${data.state}` });
      setSelectedTx(data);
      fetchTransactions();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const displayedList = buckets[activeBucket] || [];

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
              A.M. No. 24-10-14-SC Rule VI
            </span>
            <span className="text-xs text-slate-400">Judicial Commissioned Desk</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">ENP Regulated Notarial Work Queue</h2>
          <p className="text-xs text-slate-400">
            Authoritative state transitions reserved exclusively for active, commissioned Electronic Notaries Public.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-200">{currentUser.fullName}</div>
            <div className="text-[11px] text-amber-400 font-mono">Commission: {currentUser.commissionNumber || 'ENP-RTC-MNL-2024-001'}</div>
          </div>
          <button
            onClick={fetchTransactions}
            disabled={isLoading}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 11 Work Queue Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {tabsConfig.map(tab => {
          const count = buckets[tab.id]?.length || 0;
          const Icon = tab.icon;
          const isActive = activeBucket === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveBucket(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  count > 0 ? (isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300') : 'text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Transactions List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-300">
            Showing <strong className="text-amber-400">{displayedList.length}</strong> Transactions in {tabsConfig.find(t => t.id === activeBucket)?.label}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Tenant Isolation: {currentUser.tenantId}</div>
        </div>

        {displayedList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-slate-700" />
            <p className="text-sm">No items in this queue bucket.</p>
            <p className="text-xs text-slate-600">Transactions advance automatically as regulated state transitions occur.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {displayedList.map(tx => (
              <div
                key={tx.id}
                className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-400 font-bold">{tx.grNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {tx.serviceMode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {tx.state}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">{tx.documentTitle}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span>Signatory: <strong>{tx.participants[0]?.fullName || 'Principal'}</strong></span>
                    <span>Fee: PHP {tx.totalFee.toFixed(2)}</span>
                    <span>Act: {tx.actType || 'Pending Classification'}</span>
                    <span>Jurisdiction: <strong className={tx.jurisdictionStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}>{tx.jurisdictionStatus}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAction(tx)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Execute Next Action</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Execution Drawer / Modal */}
      {actionDrawerOpen && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActionDrawerOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-amber-400 font-bold">{selectedTx.grNumber}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                  {selectedTx.state}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100">{selectedTx.documentTitle}</h3>
            </div>

            {feedbackMsg && (
              <div
                className={`mb-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                }`}
              >
                {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* State-specific execution options for ENP */}
            <div className="space-y-4">
              {/* If Jurisdiction Review Required */}
              {selectedTx.state === 'JURISDICTION_REVIEW_REQUIRED' && (
                <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Territorial Jurisdiction Review</h4>
                  <p className="text-xs text-slate-300">
                    Rule VII requires physical presence in the Philippines. Telemetry flags:
                  </p>
                  <div className="p-2.5 rounded bg-slate-950 font-mono text-[11px] text-slate-300 space-y-1">
                    <div>IP Address: {selectedTx.jurisdictionEvidence?.ipAddress}</div>
                    <div>Country: {selectedTx.jurisdictionEvidence?.country}</div>
                    <div>Flags: {selectedTx.jurisdictionEvidence?.riskFlags.join(', ') || 'None'}</div>
                  </div>
                  <button
                    onClick={() =>
                      handleExecuteCommand('jurisdiction/check', {
                        ipAddress: '120.29.74.19',
                        country: 'Philippines',
                        ipCountry: 'Philippines',
                        latitude: 14.5995,
                        longitude: 120.9842,
                        vpnDetected: false,
                        proxyDetected: false
                      })
                    }
                    disabled={isProcessing}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    Confirm & Clear Territorial Jurisdiction
                  </button>
                </div>
              )}

              {/* If Synchronous Appearance Pending */}
              {selectedTx.state === 'APPEARANCE_SCHEDULED' && (
                <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Synchronous Presence Session</h4>
                  <p className="text-xs text-slate-300">
                    A.M. No. 24-10-14-SC Rule VII prohibits instant notarization. Synchronous appearance must be initiated.
                  </p>
                  <button
                    onClick={() => handleExecuteCommand('appearance/start')}
                    disabled={isProcessing}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Launch Synchronous Appearance Session ({selectedTx.serviceMode})</span>
                  </button>
                </div>
              )}

              {/* If Session in Progress */}
              {selectedTx.state === 'APPEARANCE_SESSION' && (
                <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Session in Progress</h4>
                  <p className="text-xs text-slate-300">
                    Confirm that participants appeared voluntarily, understand the contents, and confirmed identity.
                  </p>
                  <button
                    onClick={() => handleExecuteCommand('appearance/complete', { notes: 'Appearance verified by Commissioned ENP.' })}
                    disabled={isProcessing}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    Complete Session & Confirm Voluntariness
                  </button>
                </div>
              )}

              {/* Act Classification */}
              {(selectedTx.state === 'NOTARIAL_ACT_CLASSIFIED' || !selectedTx.actType) && (
                <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Rule IV Notarial Act Classification</h4>
                  <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                    <Scale className="w-4 h-4 shrink-0" />
                    <span>AI Recommendation: <strong>Acknowledgment</strong> (99.2% Confidence). ENP confirmation legally required.</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['ACKNOWLEDGMENT', 'JURAT', 'OATH_OR_AFFIRMATION', 'SIGNATURE_WITNESSING'] as NotarialActType[]).map(act => (
                      <button
                        key={act}
                        onClick={() => handleExecuteCommand('notarial-act/confirm', { actType: act })}
                        disabled={isProcessing}
                        className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-colors ${
                          selectedTx.actType === act
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {act.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ready for Signing / Participant Signing */}
              {(selectedTx.state === 'READY_FOR_SIGNING' || selectedTx.state === 'PARTICIPANT_SIGNING') && (
                <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Signatures & Regulated Execution</h4>
                  <p className="text-xs text-slate-300">
                    Participants signed: {selectedTx.participants.filter(p => p.signatureApplied).length} / {selectedTx.participants.length}
                  </p>

                  {/* Simulate participant signing if not yet signed */}
                  {selectedTx.participants.some(p => !p.signatureApplied) && (
                    <button
                      onClick={() =>
                        handleExecuteCommand('sign', {
                          participantId: selectedTx.participants[0].id,
                          signatureHex: 'PARTICIPANT_CERTIFIED_DIGITAL_SIG'
                        })
                      }
                      disabled={isProcessing}
                      className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold"
                    >
                      Capture Principal Electronic Signature
                    </button>
                  )}

                  {/* Apply ENP Signature */}
                  <button
                    onClick={() => handleExecuteCommand('enp-sign', { signatureKeyRef: 'PNPKI-TOKEN-MNL' })}
                    disabled={isProcessing || selectedTx.participants.some(p => !p.signatureApplied)}
                    className="w-full py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>Apply ENP Digital Signature (A.M. No. 24-10-14-SC Rule VI)</span>
                  </button>
                </div>
              )}

              {/* ENP Seal Pending */}
              {selectedTx.state === 'ENP_SIGNATURE_APPLIED' && (
                <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Affix Electronic Notarial Seal</h4>
                  <p className="text-xs text-slate-300">
                    Digital signature applied. Seal can now be affixed to generate Version 6 Notarized PDF/A.
                  </p>
                  <button
                    onClick={() => handleExecuteCommand('seal')}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Stamp className="w-4 h-4" />
                    <span>Affix Official Electronic Notarial Seal</span>
                  </button>
                </div>
              )}

              {/* Certificate Issuance Pending */}
              {selectedTx.state === 'ENP_SEAL_APPLIED' && (
                <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Issue Electronic Notarial Certificate</h4>
                  <button
                    onClick={() => handleExecuteCommand('certificate')}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Generate Electronic Certificate</span>
                  </button>
                </div>
              )}

              {/* Record in Notarial Book */}
              {selectedTx.state === 'CERTIFICATE_ISSUED' && (
                <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Rule VIII Electronic Notarial Book</h4>
                  <p className="text-xs text-slate-300">
                    Append entry to the cryptographic hash chain. Entry is strictly immutable once recorded.
                  </p>
                  <button
                    onClick={() => handleExecuteCommand('book-record')}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Append Entry to Notarial Book</span>
                  </button>
                </div>
              )}

              {/* Seal Evidence Package */}
              {selectedTx.state === 'NOTARIAL_BOOK_RECORDED' && (
                <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">10-Year Evidence Package</h4>
                  <button
                    onClick={() => handleExecuteCommand('evidence/seal')}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Seal Evidence Package & Manifest</span>
                  </button>
                </div>
              )}

              {/* Fee Settlement */}
              {selectedTx.state === 'EVIDENCE_SEALED' && (
                <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Judicial Fee Settlement</h4>
                  <p className="text-xs text-slate-300">
                    Statutory Fee: PHP {selectedTx.statutoryNotarialFee} | Platform Fee: PHP {selectedTx.commercialPlatformFee}
                  </p>
                  <button
                    onClick={() => handleExecuteCommand('payment', { paymentMethod: 'LandBank Judicial Portal' })}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Settle Payment (LandBank e-Payment)</span>
                  </button>
                </div>
              )}

              {/* Regulatory Sync & Complete */}
              {selectedTx.state === 'PAYMENT_SETTLED' && (
                <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Supreme Court ENA Synchronization</h4>
                  <button
                    onClick={() => handleExecuteCommand('regulatory-sync')}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Synchronize to Supreme Court ENA</span>
                  </button>
                </div>
              )}

              {selectedTx.state === 'REGULATORY_SYNC_COMPLETED' && (
                <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Complete Notarial Transaction</h4>
                  <button
                    onClick={() => handleExecuteCommand('complete')}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finalize & Mark COMPLETE</span>
                  </button>
                </div>
              )}

              {selectedTx.state === 'COMPLETE' && (
                <div className="p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                  <h4 className="text-base font-bold text-slate-100">Transaction Fully Completed</h4>
                  <p className="text-xs text-slate-300">
                    Official Public Instrument archived. Verifiable via QR token reference.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
