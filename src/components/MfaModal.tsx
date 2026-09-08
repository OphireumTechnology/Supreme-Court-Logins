import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Smartphone, Fingerprint, X, AlertTriangle } from 'lucide-react';

interface MfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionTitle: string;
  userEmail: string;
}

export const MfaModal: React.FC<MfaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionTitle,
  userEmail
}) => {
  const [method, setMethod] = useState<'TOTP' | 'BIOMETRIC' | 'SMS'>('TOTP');
  const [totpCode, setTotpCode] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricPassed, setBiometricPassed] = useState(false);

  if (!isOpen) return null;

  const handleVerify = () => {
    setError(null);
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      if (method === 'TOTP') {
        if (totpCode.length !== 6 || isNaN(Number(totpCode))) {
          setError('Invalid 6-digit TOTP code. Try sample: 849201');
          return;
        }
      } else if (method === 'SMS') {
        if (smsCode.length !== 6 || isNaN(Number(smsCode))) {
          setError('Invalid 6-digit SMS OTP. Try sample: 123456');
          return;
        }
      } else if (method === 'BIOMETRIC') {
        if (!biometricPassed) {
          setError('Please complete facial/fingerprint liveness verification first.');
          return;
        }
      }

      onSuccess();
      onClose();
    }, 700);
  };

  const handleSimulateBiometric = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setBiometricPassed(true);
      setError(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 p-5 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Supreme Court MFA Security Gate</h3>
              <p className="text-xs text-amber-400/90 font-mono">A.M. No. 24-10-14-SC Compliance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-xs text-slate-300">
            <div className="text-slate-400 font-semibold mb-1">Target Operation:</div>
            <div className="text-amber-300 font-mono font-medium">{actionTitle}</div>
            <div className="text-[11px] text-slate-400 mt-1">Authenticated user: {userEmail}</div>
          </div>

          {/* Method selector tabs */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => { setMethod('TOTP'); setError(null); }}
              className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1.5 transition-all border ${
                method === 'TOTP'
                  ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>TOTP App</span>
            </button>
            <button
              onClick={() => { setMethod('BIOMETRIC'); setError(null); }}
              className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1.5 transition-all border ${
                method === 'BIOMETRIC'
                  ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              <span>Biometrics</span>
            </button>
            <button
              onClick={() => { setMethod('SMS'); setError(null); }}
              className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1.5 transition-all border ${
                method === 'SMS'
                  ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>SMS OTP</span>
            </button>
          </div>

          {/* Active input based on method */}
          {method === 'TOTP' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 block">
                Enter 6-digit Authenticator Code (Google Auth / Judicial Token):
              </label>
              <input
                type="text"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.trim())}
                placeholder="e.g. 849201"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-xl font-mono tracking-widest text-amber-300 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500 text-center">
                Demo helper: Any 6 digits accepted (e.g., <button onClick={() => setTotpCode('849201')} className="text-amber-400 underline font-mono">849201</button>)
              </p>
            </div>
          )}

          {method === 'BIOMETRIC' && (
            <div className="space-y-3 text-center py-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 border-2 border-amber-500/40 flex items-center justify-center text-amber-400">
                <Fingerprint className={`w-8 h-8 ${isVerifying ? 'animate-pulse text-amber-300' : ''}`} />
              </div>
              <div className="text-xs text-slate-300">
                {biometricPassed ? (
                  <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Biometric Identity Verified (PhilSys e-KYC)
                  </span>
                ) : (
                  'Perform facial liveness challenge or hardware security key touch'
                )}
              </div>
              {!biometricPassed && (
                <button
                  type="button"
                  onClick={handleSimulateBiometric}
                  disabled={isVerifying}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-medium transition-all"
                >
                  {isVerifying ? 'Scanning Biometrics & Liveness...' : 'Trigger Facial Liveness Verification'}
                </button>
              )}
            </div>
          )}

          {method === 'SMS' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 block">
                SMS One-Time Pin sent to registered mobile number:
              </label>
              <input
                type="text"
                maxLength={6}
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value.trim())}
                placeholder="123456"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-xl font-mono tracking-widest text-amber-300 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500 text-center">
                Demo helper: Click to fill <button onClick={() => setSmsCode('123456')} className="text-amber-400 underline font-mono">123456</button>
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-900/40 flex items-center justify-center gap-1.5"
            >
              {isVerifying ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize &amp; Proceed</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
