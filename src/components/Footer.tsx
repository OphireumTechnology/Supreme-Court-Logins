import React from 'react';
import { Scale, ShieldCheck, Lock, Globe, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Scale className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-100 font-serif text-sm">
                SUPREME COURT OF THE PHILIPPINES &bull; ENF PLATFORM
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Official Electronic Notarization Facility (ENF) operating in strict compliance with A.M. No. 24-10-14-SC (Rules on Electronic Notarization), Republic Act No. 8792 (E-Commerce Act of 2000), and the 2004 Rules on Notarial Practice.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-semibold text-slate-200 text-xs font-mono uppercase tracking-wider text-amber-400">
              Security &amp; Privacy Standards
            </div>
            <ul className="space-y-1 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>AES-256 GCM Multi-Storage Vaults</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>HIPAA &amp; GDPR Compliant Controls</span>
              </li>
              <li className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Rule VIII Tamper-Evident Ledger</span>
              </li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <div className="font-semibold text-slate-200 text-xs font-mono uppercase tracking-wider text-amber-400">
              Regulatory Oversight
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Supervised by the Electronic Notary Administrator (ENA), Management Information Systems Office (MISO), and the Office of the Bar Confidant (OBC).
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
          <div>
            &copy; {new Date().getFullYear()} Supreme Court of the Philippines. All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <span>A.M. No. 24-10-14-SC</span>
            <span>&bull;</span>
            <span>R.A. 10173 (Data Privacy Act)</span>
            <span>&bull;</span>
            <span>E2EE Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
