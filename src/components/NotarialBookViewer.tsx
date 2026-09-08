import React, { useState } from 'react';
import { NotarialBookEntry, UserProfile } from '../types';
import { 
  BookOpen, 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  Link as LinkIcon, 
  Lock,
  Calendar,
  Layers
} from 'lucide-react';
import { verifyNotarialChain, exportToCSV, generatePrintableReport } from '../utils/crypto';

interface NotarialBookViewerProps {
  entries: NotarialBookEntry[];
  currentUser: UserProfile;
}

export const NotarialBookViewer: React.FC<NotarialBookViewerProps> = ({
  entries,
  currentUser
}) => {
  const [search, setSearch] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    details: string;
  } | null>(null);

  const filteredEntries = entries.filter(e => 
    e.grNumber.toLowerCase().includes(search.toLowerCase()) ||
    e.documentTitle.toLowerCase().includes(search.toLowerCase()) ||
    e.principalName.toLowerCase().includes(search.toLowerCase()) ||
    e.entryHash.toLowerCase().includes(search.toLowerCase())
  );

  const handleVerifyChain = () => {
    const result = verifyNotarialChain(entries);
    setVerificationResult(result);
  };

  const handleExportCSV = () => {
    const rows = entries.map(e => ({
      'Seq No': e.sequenceNumber,
      'G.R. Number': e.grNumber,
      'Act Type': e.actType,
      'Document Title': e.documentTitle,
      'Principal': e.principalName,
      'Competent Evidence ID': e.competentEvidenceId,
      'Fee Charged (PHP)': e.feeCharged,
      'Mode': e.serviceMode,
      'Timestamp': e.timestamp,
      'Cryptographic Entry Hash': e.entryHash,
      'Previous Entry Hash': e.previousEntryHash
    }));
    exportToCSV(`Rule_VIII_Electronic_Notarial_Book_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const handlePrintReport = () => {
    const headers = ['Seq #', 'G.R. Number', 'Act', 'Document', 'Principal', 'Fee', 'Mode', 'Timestamp', 'Hash Link'];
    const rows = entries.map(e => [
      `#${e.sequenceNumber}`,
      e.grNumber,
      e.actType,
      e.documentTitle.length > 25 ? e.documentTitle.slice(0, 25) + '...' : e.documentTitle,
      e.principalName,
      `₱${e.feeCharged}`,
      e.serviceMode,
      e.timestamp,
      e.entryHash.slice(0, 12) + '...'
    ]);
    generatePrintableReport(
      'Official Register of Electronic Notarial Acts (Rule VIII)',
      `Supreme Court of the Philippines &bull; ENP: ${currentUser.fullName} (${currentUser.commissionNumber || 'ENP-NCR-2025-0089'})`,
      headers,
      rows
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
            <BookOpen className="w-4 h-4" />
            <span>RULE VIII STATUTORY REGISTER &bull; A.M. NO. 24-10-14-SC</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 font-serif">
            Electronic Notarial Book &amp; Immutable Cryptographic Ledger
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Statutory chronological official register of electronic notarial acts. Entries are cryptographically hash-chained (blockchain-modeled) and append-only. Once recorded, entries can never be modified or deleted.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleVerifyChain}
            className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit Ledger Integrity</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
          verificationResult.isValid
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
        }`}>
          {verificationResult.isValid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <div className="space-y-1">
            <div className="font-bold text-sm">
              {verificationResult.isValid ? 'Ledger Chain Verification: PASSED' : 'Ledger Chain Alert: INTEGRITY FAILED'}
            </div>
            <p className="font-mono text-[11px] leading-relaxed">
              {verificationResult.details}
            </p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter notarial book entries by G.R. number, title, principal, or hash..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3 transition-all"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="bg-amber-950/70 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded font-mono font-bold text-xs">
                  Seq #{entry.sequenceNumber}
                </span>
                <span className="font-mono text-xs font-bold text-slate-200">
                  {entry.grNumber}
                </span>
                <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {entry.actType}
                </span>
                <span className="text-[11px] bg-cyan-950/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40 font-mono">
                  {entry.serviceMode}
                </span>
              </div>

              <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{entry.timestamp}</span>
              </div>
            </div>

            {/* Document and Principal */}
            <div>
              <h4 className="text-sm font-bold text-slate-100 font-serif">{entry.documentTitle}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 mt-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Principal Name:</span>
                  <span className="font-medium text-slate-200">{entry.principalName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Competent Evidence of ID:</span>
                  <span className="font-mono text-amber-400/90">{entry.competentEvidenceId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Commissioned ENP:</span>
                  <span className="text-slate-200">{entry.enpName} ({entry.enpId})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Statutory Notarial Fee:</span>
                  <span className="font-semibold text-emerald-400">₱{entry.feeCharged.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Cryptographic Hashes Chaining */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1">
              <div className="flex items-center gap-2 text-slate-400">
                <LinkIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-500">Prev Block Hash:</span>
                <span className="text-slate-400 truncate">{entry.previousEntryHash}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-500">Entry Hash Seal:</span>
                <span className="truncate">{entry.entryHash}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
