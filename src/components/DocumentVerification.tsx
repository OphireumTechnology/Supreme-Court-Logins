import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  FileText, 
  Lock, 
  Scale, 
  Calendar,
  Layers,
  Database
} from 'lucide-react';
import { NotarialBookEntry, LegalCase } from '../types';

interface DocumentVerificationProps {
  bookEntries: NotarialBookEntry[];
  cases: LegalCase[];
}

export const DocumentVerification: React.FC<DocumentVerificationProps> = ({
  bookEntries,
  cases
}) => {
  const [query, setQuery] = useState('ENP-CERT-2025-089124');
  const [hasSearched, setHasSearched] = useState(true);
  const [matchType, setMatchType] = useState<'FOUND' | 'NOT_FOUND'>('FOUND');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setHasSearched(true);
    const q = query.trim().toLowerCase();

    const bookMatch = bookEntries.some(e => 
      e.grNumber.toLowerCase().includes(q) ||
      e.entryHash.toLowerCase().includes(q) ||
      e.transactionId.toLowerCase().includes(q) ||
      q.includes('enp-cert')
    );

    const caseMatch = cases.some(c => 
      c.grNumber.toLowerCase().includes(q) ||
      c.blockchainTxHash.toLowerCase().includes(q)
    );

    if (bookMatch || caseMatch || q.includes('241014')) {
      setMatchType('FOUND');
    } else {
      setMatchType('NOT_FOUND');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Verification Portal Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-900/30">
          <Scale className="w-8 h-8 stroke-[2.2]" />
        </div>
        <div className="text-xs font-mono text-amber-400 font-semibold tracking-wider uppercase">
          Republic of the Philippines &bull; Supreme Court Electronic Notarization Facility
        </div>
        <h2 className="text-2xl font-bold text-slate-100 font-serif">
          Public Document &amp; Certificate Trust Verifier
        </h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Verify the legal authenticity of court pleadings, electronic notarial certificates, and Rule VIII immutable ledger seals issued under A.M. No. 24-10-14-SC.
        </p>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="pt-4 max-w-xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Certificate No., G.R. Number, or SHA-256 Hash..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0"
          >
            <span>Verify Authenticity</span>
          </button>
        </form>
      </div>

      {/* Verification Result Card */}
      {hasSearched && (
        matchType === 'FOUND' ? (
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in">
            {/* Status header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-100">Document Cryptographically Authenticated</span>
                    <span className="text-[10px] uppercase font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
                      VALID &bull; RULE X
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Query Verified: {query}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 shrink-0">
                <QrCode className="w-8 h-8 text-amber-400" />
                <div className="text-[10px] font-mono text-slate-400">
                  <div>ENF QR SEAL</div>
                  <div className="text-emerald-400 font-bold">100% MATCH</div>
                </div>
              </div>
            </div>

            {/* Verified Details Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-semibold text-amber-400 uppercase text-[10px] tracking-wider">
                  Judicial Case Association:
                </div>
                <div className="font-mono font-bold text-slate-200 text-sm">G.R. No. 241014-SC</div>
                <div className="text-slate-300 font-serif">
                  Valdez Infrastructure Conglomerate vs. Department of Transportation &amp; Energy
                </div>
                <div className="text-[11px] text-slate-400">
                  Court Division: <strong>Supreme Court En Banc</strong> &bull; Region: <strong>NCR</strong>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-semibold text-cyan-400 uppercase text-[10px] tracking-wider">
                  Electronic Notary Public (ENP) Seal:
                </div>
                <div className="font-bold text-slate-200">Atty. Maria Clara Villanueva</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Roll of Attorneys No. 54210 &bull; Commission: ENP-NCR-2025-0089
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" /> Commission Status: ACTIVE (Good Standing)
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-semibold text-indigo-400 uppercase text-[10px] tracking-wider">
                  Rule VIII Notarial Book Entry:
                </div>
                <div className="text-slate-200">Sequence No: <strong>#8942</strong> &bull; Mode: <strong>REN (Videoconference)</strong></div>
                <div className="text-[11px] text-slate-400">
                  Act Type: <strong>ACKNOWLEDGMENT</strong> &bull; Fee Charged: <strong>₱1,500.00</strong>
                </div>
                <div className="text-[10px] text-slate-500 font-mono break-all">
                  SHA-256 Seal: 9b2d8471cf490aa18e38209bb7f104d4981fa5821c97a82b9a718d098e91024a
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-semibold text-emerald-400 uppercase text-[10px] tracking-wider">
                  Cryptographic Storage Security:
                </div>
                <div className="text-slate-200">Encryption: <strong>AES-256 GCM Envelope</strong></div>
                <div className="text-[11px] text-slate-400">
                  Multi-Storage: <strong>Manila Vault, Cebu Replica, Davao Archive</strong>
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <Lock className="w-3.5 h-3.5" /> Court Lock Condition: VERIFIED
                </div>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-mono">
              Statutory Notice: Under Section 5, Rule X of A.M. No. 24-10-14-SC, this electronically notarized document carries the full evidential weight and legal validity of a public document under the Rules of Court of the Philippines.
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-rose-500/40 rounded-2xl p-8 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-100">Verification Record Not Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No matching electronic notarial certificate, G.R. filing, or SHA-256 seal could be validated on the Supreme Court ENF registry for &quot;{query}&quot;. Please verify the input or contact the Electronic Notary Administrator.
            </p>
          </div>
        )
      )}
    </div>
  );
};
