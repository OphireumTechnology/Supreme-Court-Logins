import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Lock,
  Cpu,
  Database,
  Radio,
  Clock
} from 'lucide-react';

interface ProviderItem {
  id: string;
  name: string;
  category: string;
  environment: 'SANDBOX' | 'MOCK' | 'PRODUCTION';
  status: string;
  approvalStatus: string;
  approvalReference: string;
  latencyMs: number;
  details: string;
}

export const ProviderHealthDashboard: React.FC = () => {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [systemStatus, setSystemStatus] = useState('OPERATIONAL');
  const [lastCheck, setLastCheck] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/v1/admin/integrations/health');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers);
        setSystemStatus(data.systemStatus);
        setLastCheck(data.timestamp);
      }
    } catch (err) {
      console.error('Failed to fetch provider health:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              {systemStatus}
            </span>
            <span className="text-xs text-slate-400">Institutional Integration Diagnostics</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">Government & Infrastructure Provider Gateway</h2>
          <p className="text-xs text-slate-400">
            Real-time status of all 11 external identity, trust, regulatory, communication, and judicial vault subsystems.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-slate-400 hidden sm:block">
            <div>Last Polled</div>
            <div className="font-mono text-slate-300">{lastCheck ? new Date(lastCheck).toLocaleTimeString() : 'Connecting...'}</div>
          </div>
          <button
            onClick={fetchHealth}
            disabled={isLoading}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>
      </div>

      {/* Grid of 11 Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map(prov => {
          const isMock = prov.environment === 'MOCK';
          const isSandbox = prov.environment === 'SANDBOX';
          const isProd = prov.environment === 'PRODUCTION';

          return (
            <div
              key={prov.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {prov.category.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      isProd
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isMock
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {prov.environment}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 leading-snug">{prov.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{prov.details}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Approval Ref:</span>
                  <span className="font-mono text-slate-300 truncate max-w-[160px]">{prov.approvalReference}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Roundtrip Latency:</span>
                  <span className="font-mono text-emerald-400">{prov.latencyMs} ms</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="font-semibold text-slate-200">{prov.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
