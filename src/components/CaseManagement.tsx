import React, { useState, useMemo } from 'react';
import { 
  LegalCase, 
  GeographicRegion, 
  UserProfile, 
  EncryptedDocument 
} from '../types';
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Lock, 
  Unlock, 
  Clock, 
  Calendar, 
  MapPin, 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  ExternalLink,
  Layers,
  ChevronRight,
  Database,
  BarChart3,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { exportToCSV, generatePrintableReport } from '../utils/crypto';

interface CaseManagementProps {
  cases: LegalCase[];
  currentUser: UserProfile;
  onOpenUploadModal: (caseId: string) => void;
  onRequestCourtKey: (caseItem: LegalCase) => void;
  onStartNotarization: (caseItem: LegalCase) => void;
  onSelectCaseForMessaging: (caseItem: LegalCase) => void;
  onRequestMfaUnlock: (doc: EncryptedDocument, caseItem: LegalCase) => void;
}

export const CaseManagement: React.FC<CaseManagementProps> = ({
  cases,
  currentUser,
  onOpenUploadModal,
  onRequestCourtKey,
  onStartNotarization,
  onSelectCaseForMessaging,
  onRequestMfaUnlock
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [activeCaseDetails, setActiveCaseDetails] = useState<LegalCase | null>(null);

  // Available regions
  const regions: GeographicRegion[] = [
    'National Capital Region (NCR)',
    'Region I - Ilocos Region',
    'Region II - Cagayan Valley',
    'Region III - Central Luzon',
    'Region IV-A - CALABARZON',
    'Region V - Bicol Region',
    'Region VI - Western Visayas',
    'Region VII - Central Visayas',
    'Region VIII - Eastern Visayas',
    'Region IX - Zamboanga Peninsula',
    'Region X - Northern Mindanao',
    'Region XI - Davao Region',
    'Region XII - SOCCSKSARGEN',
    'Region XIII - Caraga',
    'BARMM'
  ];

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchSearch =
        c.grNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.attorneyName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRegion = selectedRegion === 'ALL' || c.region === selectedRegion;
      const matchStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
      const matchDivision = selectedDivision === 'ALL' || c.courtDivision === selectedDivision;

      return matchSearch && matchRegion && matchStatus && matchDivision;
    });
  }, [cases, searchQuery, selectedRegion, selectedStatus, selectedDivision]);

  // Analytics
  const stats = useMemo(() => {
    const total = cases.length;
    const underDelib = cases.filter(c => c.status === 'UNDER_DELIBERATION').length;
    const hearings = cases.filter(c => c.status === 'HEARING_SCHEDULED').length;
    const decided = cases.filter(c => c.status === 'DECIDED').length;
    const pendingKey = cases.filter(c => !c.decryptionKeyApproved).length;
    return { total, underDelib, hearings, decided, pendingKey };
  }, [cases]);

  // Export to CSV
  const handleExportCSV = () => {
    const rows = filteredCases.map(c => ({
      'G.R. Number': c.grNumber,
      'Case Title': c.title,
      'Court Division': c.courtDivision,
      'Ponente Justice': c.ponente,
      'Status': c.status,
      'Geographic Region': c.region,
      'Priority': c.priority,
      'Litigant/Client': c.clientName,
      'Lead Attorney': c.attorneyName,
      'Filing Date': c.filingDate,
      'Next Hearing': c.nextHearingDate || 'N/A',
      'Encrypted Documents Count': c.documents.length,
      'Court Key Decided': c.decryptionKeyApproved ? 'YES' : 'LOCKED - COURT KEY REQUIRED',
      'Blockchain Record Hash': c.blockchainTxHash
    }));
    exportToCSV(`Supreme_Court_Cases_Report_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  // Export / Print PDF
  const handleExportPDF = () => {
    const headers = ['G.R. Number', 'Title', 'Division', 'Status', 'Region', 'Next Hearing', 'Court Key Status'];
    const rows = filteredCases.map(c => [
      c.grNumber,
      c.title.length > 35 ? c.title.slice(0, 35) + '...' : c.title,
      c.courtDivision,
      c.status,
      c.region,
      c.nextHearingDate || 'Unscheduled',
      c.decryptionKeyApproved ? 'Unlocked (Court Order)' : 'Locked'
    ]);
    generatePrintableReport(
      'Judicial Legal Case Filings & Traceability Report',
      `Filtered by Region: ${selectedRegion} | Total Records: ${filteredCases.length}`,
      headers,
      rows
    );
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Analytics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Total G.R. Filings</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{stats.total}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <span>Blockchain Immutability: 100%</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Under Deliberation</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 mt-2">{stats.underDelib}</div>
          <div className="text-[11px] text-slate-400 mt-1">En Banc &amp; Divisions</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Hearings Scheduled</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300 mt-2">{stats.hearings}</div>
          <div className="text-[11px] text-slate-400 mt-1">Automated SMS/Email alerts active</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Decided / En Banc</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 mt-2">{stats.decided}</div>
          <div className="text-[11px] text-slate-400 mt-1">Full Legal Traceability</div>
        </div>

        <div className="bg-slate-900/90 border border-rose-950/60 bg-rose-950/20 rounded-2xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-xs text-rose-300 font-medium flex items-center justify-between">
            <span>Court-Locked Files</span>
            <Lock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-200 mt-2">{stats.pendingKey}</div>
          <div className="text-[11px] text-rose-300/80 mt-1">Requires Approving Body Key</div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, and Export */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by G.R. Number, Case Title, Litigant, or Attorney..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Export filtered records to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Print formatted judicial report or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          {/* Region filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>Geographic Region:</span>
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Regions (Nationwide)</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Judicial Status:</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_PETITION">Pending Petition</option>
              <option value="HEARING_SCHEDULED">Hearing Scheduled</option>
              <option value="UNDER_DELIBERATION">Under Deliberation</option>
              <option value="DECIDED">Decided</option>
              <option value="ENTRY_OF_JUDGMENT">Entry of Judgment</option>
            </select>
          </div>

          {/* Division filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>Court Division:</span>
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Divisions</option>
              <option value="En Banc">En Banc</option>
              <option value="First Division">First Division</option>
              <option value="Second Division">Second Division</option>
              <option value="Third Division">Third Division</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case List Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Showing <strong>{filteredCases.length}</strong> of {cases.length} Court Cases</span>
          <span className="text-amber-400/90 font-mono">Traceability: A.M. No. 24-10-14-SC</span>
        </div>

        {filteredCases.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <ShieldAlert className="w-10 h-10 mx-auto text-amber-500/60" />
            <div className="text-base font-semibold text-slate-200">No matching court cases found</div>
            <p className="text-xs max-w-md mx-auto">
              Try adjusting your geographic region filter or search parameters for G.R. numbers.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCases.map((caseItem) => {
              const isLocked = !caseItem.decryptionKeyApproved;
              return (
                <div
                  key={caseItem.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-sm bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-lg">
                          {caseItem.grNumber}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {caseItem.courtDivision}
                        </span>
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          caseItem.priority === 'VERY_URGENT_TRO'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                            : caseItem.priority === 'URGENT'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {caseItem.priority.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 ${
                          caseItem.status === 'UNDER_DELIBERATION'
                            ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                            : caseItem.status === 'HEARING_SCHEDULED'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                            : caseItem.status === 'DECIDED'
                            ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/40'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {caseItem.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-100 font-serif leading-snug">
                        {caseItem.title}
                      </h3>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span><strong>Ponente:</strong> {caseItem.ponente}</span>
                        <span><strong>Filing Date:</strong> {caseItem.filingDate}</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          {caseItem.region}
                        </span>
                      </div>
                    </div>

                    {/* Hearing date & Key Lock status */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                      {caseItem.nextHearingDate && (
                        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-300">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Next Hearing:</div>
                          <div className="font-semibold">{caseItem.nextHearingDate}</div>
                        </div>
                      )}

                      <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                        isLocked
                          ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                          : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      }`}>
                        {isLocked ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-wider">Storage Lock Status</div>
                          <div className="font-semibold">{isLocked ? 'Locked (Court Key Req.)' : 'Unlocked by En Banc'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <span className="font-semibold text-slate-400">Judicial Synopsis: </span>
                    {caseItem.summary}
                  </p>

                  {/* Litigant & Counsel Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">Litigant / Petitioner:</span>
                      <span className="text-slate-200 font-medium">{caseItem.clientName}</span>
                      <span className="text-slate-400 text-[11px] block">{caseItem.clientEmail}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">Lead Attorney:</span>
                      <span className="text-slate-200 font-medium">{caseItem.attorneyName} (Roll No. {caseItem.attorneyRollNo})</span>
                      <span className="text-amber-400/90 text-[11px] block">Supreme Court Bar Member in Good Standing</span>
                    </div>
                  </div>

                  {/* Attached Encrypted Documents */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-amber-400" />
                        <span>AES-256 Multi-Storage Vault ({caseItem.documents.length} Files)</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Ledger Seal: {caseItem.blockchainTxHash.slice(0, 18)}...
                      </span>
                    </div>

                    {caseItem.documents.length === 0 ? (
                      <div className="p-3 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-xs text-slate-500 text-center">
                        No exhibits uploaded yet. Click &quot;Upload Sealed Document&quot; below.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {caseItem.documents.map((doc) => {
                          const docLocked = isLocked || doc.isCourtLocked;
                          return (
                            <div
                              key={doc.id}
                              className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-xs space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                                  <span className="font-medium text-slate-200 truncate max-w-[220px]" title={doc.title}>
                                    {doc.title}
                                  </span>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                  docLocked
                                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                }`}>
                                  {docLocked ? 'LOCKED' : 'AES-256 GCM'}
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono">
                                <span>{(doc.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                                <span>Uploaded: {doc.uploadedAt}</span>
                              </div>

                              <div className="text-[10px] text-slate-500 truncate font-mono" title={`SHA-256: ${doc.sha256Hash}`}>
                                SHA-256: {doc.sha256Hash.slice(0, 24)}...
                              </div>

                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <span className="text-slate-500">Storage:</span>
                                <span className="text-cyan-400">{doc.storageLocations.join(', ')}</span>
                              </div>

                              {/* Document Action */}
                              <div className="pt-1 flex items-center justify-between">
                                {docLocked ? (
                                  <button
                                    onClick={() => onRequestCourtKey(caseItem)}
                                    className="text-[11px] text-rose-300 hover:text-rose-200 font-medium flex items-center gap-1 underline underline-offset-2"
                                  >
                                    <Lock className="w-3 h-3" />
                                    <span>Request Court Key Decision</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => onRequestMfaUnlock(doc, caseItem)}
                                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 underline underline-offset-2"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Download via MFA Decryption</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenUploadModal(caseItem.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Upload Sealed Document</span>
                      </button>

                      <button
                        onClick={() => onStartNotarization(caseItem)}
                        className="px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <span>E-Notarize Filing (IEN/REN)</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectCaseForMessaging(caseItem)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <span>Counsel &bull; Client Chat</span>
                      </button>

                      {isLocked && (
                        <button
                          onClick={() => onRequestCourtKey(caseItem)}
                          className="px-3 py-1.5 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Petition Court for Key Release</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
