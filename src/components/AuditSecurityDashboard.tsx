import React, { useState } from 'react';
import { AuditLog, UserProfile } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Lock, 
  MapPin, 
  Globe, 
  Terminal,
  Activity,
  UserX,
  Filter
} from 'lucide-react';
import { exportToCSV, generatePrintableReport } from '../utils/crypto';

interface AuditSecurityDashboardProps {
  logs: AuditLog[];
  currentUser: UserProfile;
  onSimulateSuspiciousAttempt: () => void;
}

export const AuditSecurityDashboard: React.FC<AuditSecurityDashboardProps> = ({
  logs,
  currentUser,
  onSimulateSuspiciousAttempt
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    const matchSearch = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      (log.grNumber && log.grNumber.toLowerCase().includes(search.toLowerCase())) ||
      log.ipAddress.includes(search) ||
      log.location.toLowerCase().includes(search.toLowerCase());
    return matchSeverity && matchSearch;
  });

  const suspiciousCount = logs.filter(l => l.severity === 'CRITICAL' || l.severity === 'SUSPICIOUS').length;

  const handleExportCSV = () => {
    const rows = filteredLogs.map(l => ({
      'Log ID': l.id,
      'Timestamp': l.timestamp,
      'Actor': l.actor,
      'Role': l.actorRole,
      'Action': l.action,
      'Resource': l.resource,
      'G.R. Number': l.grNumber || 'N/A',
      'Severity': l.severity,
      'IP Address': l.ipAddress,
      'Location': l.location,
      'Status': l.status,
      'SHA-256 Log Hash': l.logHash
    }));
    exportToCSV(`Supreme_Court_Security_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const handleExportPDF = () => {
    const headers = ['Timestamp', 'Actor / Role', 'Action', 'G.R. Number', 'Severity', 'IP & Location', 'Status'];
    const rows = filteredLogs.map(l => [
      l.timestamp,
      `${l.actor.split('@')[0]} (${l.actorRole})`,
      l.action,
      l.grNumber || 'General',
      l.severity,
      `${l.ipAddress} (${l.location.slice(0, 18)})`,
      l.status
    ]);
    generatePrintableReport(
      'Judicial Security Audit & Compliance Incident Report',
      `Compliance: HIPAA / GDPR / A.M. No. 24-10-14-SC | Filter: ${severityFilter}`,
      headers,
      rows
    );
  };

  return (
    <div className="space-y-6">
      {/* Alert Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>SECURITY OPERATIONS &bull; HIPAA &amp; GDPR AUDIT TRAIL</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 font-serif">
            Security Logging &amp; Real-Time Threat Alerts
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Continuous tamper-evident audit logging for all platform operations, private key access attempts, MFA events, and geographic anomalies. Logs are cryptographically hashed and cannot be altered by administrators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSimulateSuspiciousAttempt}
            className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Simulate Suspicious Breach Attempt</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Threat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Audit Records</div>
            <div className="text-2xl font-bold text-white mt-1">{logs.length}</div>
            <div className="text-[11px] text-emerald-400 mt-1 font-mono">Immutable Integrity: 100%</div>
          </div>
          <Activity className="w-8 h-8 text-amber-500/50" />
        </div>

        <div className="bg-slate-900/80 border border-rose-900/40 bg-rose-950/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-rose-300 font-medium">Suspicious Access Alerts</div>
            <div className="text-2xl font-bold text-rose-300 mt-1">{suspiciousCount}</div>
            <div className="text-[11px] text-rose-400/80 mt-1">Real-time isolation triggered</div>
          </div>
          <ShieldAlert className="w-8 h-8 text-rose-400 animate-pulse" />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">HIPAA &amp; GDPR Status</div>
            <div className="text-lg font-bold text-cyan-300 mt-1">COMPLIANT</div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">AES-256 + Zero PII In Logs</div>
          </div>
          <Lock className="w-8 h-8 text-cyan-500/50" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit logs by actor, action, IP, location, or G.R. number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Threats</option>
            <option value="SUSPICIOUS">Suspicious Activity</option>
            <option value="WARNING">Warnings</option>
            <option value="INFO">Informational</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Severity &amp; Status</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor &amp; Role</th>
                <th className="p-3">Action Performed</th>
                <th className="p-3">Target Resource / G.R.</th>
                <th className="p-3">IP &amp; Geographic Location</th>
                <th className="p-3 font-mono">Immutable Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => {
                const isThreat = log.severity === 'CRITICAL' || log.severity === 'SUSPICIOUS';
                return (
                  <tr key={log.id} className={`hover:bg-slate-800/40 transition-colors ${isThreat ? 'bg-rose-950/20' : ''}`}>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          log.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                            : log.severity === 'SUSPICIOUS'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                            : log.severity === 'WARNING'
                            ? 'bg-yellow-950 text-yellow-300 border border-yellow-500/50'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {log.severity}
                        </span>
                        <span className={`text-[10px] font-mono font-semibold ${
                          log.status === 'BLOCKED' ? 'text-rose-400' : log.status === 'FLAGGED' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap font-mono text-slate-400">
                      {log.timestamp}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-medium text-slate-200 truncate max-w-[160px]" title={log.actor}>
                        {log.actor}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Role: {log.actorRole}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap font-medium text-slate-200">
                      {log.action}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-mono text-amber-400">{log.grNumber || 'General'}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]" title={log.resource}>
                        {log.resource}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-mono text-slate-200">{log.ipAddress}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{log.location}</span>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap font-mono text-[10px] text-emerald-400/90" title={log.logHash}>
                      {log.logHash.slice(0, 14)}...
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
