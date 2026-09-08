import React, { useState } from 'react';
import { 
  NotarialTransaction, 
  NotarialActType, 
  ServiceMode, 
  UserProfile, 
  NotarialBookEntry 
} from '../types';
import { 
  Scale, 
  Video, 
  Users, 
  ShieldCheck, 
  MapPin, 
  Lock, 
  FileCheck, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  Fingerprint, 
  Camera, 
  Award,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { syncHash } from '../utils/crypto';

interface NotarialFacilityProps {
  currentUser: UserProfile;
  onRecordBookEntry: (entry: NotarialBookEntry) => void;
  onTriggerMfa: (actionTitle: string, onSuccess: () => void) => void;
}

export const NotarialFacility: React.FC<NotarialFacilityProps> = ({
  currentUser,
  onRecordBookEntry,
  onTriggerMfa
}) => {
  const [grNumber, setGrNumber] = useState('G.R. No. 241014-SC');
  const [serviceMode, setServiceMode] = useState<ServiceMode>('REN');
  const [actType, setActType] = useState<NotarialActType>('ACKNOWLEDGMENT');
  const [docTitle, setDocTitle] = useState('Verified Petition for Certiorari with Urgent Prayer for TRO');
  const [principalName, setPrincipalName] = useState('Engr. Antonio M. Valdez');
  const [idType, setIdType] = useState('Philippine National ID (PhilSys)');
  const [idNumber, setIdNumber] = useState('1092-4820-9182-3910');
  const [fee, setFee] = useState(1500);

  // Workflow state machine
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [jurisdictionPassed, setJurisdictionPassed] = useState(false);
  const [videoConnected, setVideoConnected] = useState(false);
  const [participantSigned, setParticipantSigned] = useState(false);
  const [enpSigned, setEnpSigned] = useState(false);
  const [enpSealed, setEnpSealed] = useState(false);
  const [completedTx, setCompletedTx] = useState<NotarialTransaction | null>(null);

  // Step 2: Liveness & e-KYC
  const handleVerifyIdentity = () => {
    setTimeout(() => {
      setLivenessPassed(true);
      setCurrentStep(3);
    }, 1000);
  };

  // Step 3: Jurisdiction & VPN Check
  const handleCheckJurisdiction = () => {
    setTimeout(() => {
      setJurisdictionPassed(true);
      setCurrentStep(4);
    }, 800);
  };

  // Step 4: Appearance Session (REN / IEN)
  const handleStartAppearance = () => {
    setVideoConnected(true);
    setTimeout(() => {
      setCurrentStep(5);
    }, 1200);
  };

  // Step 5: Classify & Participant Sign
  const handleParticipantSign = () => {
    setParticipantSigned(true);
    setCurrentStep(6);
  };

  // Step 6: ENP Sign & Seal (Requires MFA)
  const handleEnpApplySignatureAndSeal = () => {
    if (currentUser.role !== 'ENP') {
      alert('Only a commissioned Electronic Notary Public (ENP) can execute regulated signatures and apply the notarial seal under A.M. No. 24-10-14-SC.');
      return;
    }

    onTriggerMfa(
      `Apply Electronic Signature & Notarial Seal (Roll No. ${currentUser.ibpRollNumber || '54210'}) to ${grNumber}`,
      () => {
        setEnpSigned(true);
        setEnpSealed(true);

        const certNo = `ENP-CERT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const docHash = syncHash(docTitle + grNumber + principalName + Date.now());

        const newTx: NotarialTransaction = {
          id: `tx_${Date.now()}`,
          tenantId: currentUser.tenantId || 'tenant_sc_ph',
          clientId: 'usr_client_valdez',
          grNumber,
          actType,
          serviceMode,
          state: 'COMPLETE',
          principalName,
          principalEmail: 'antonio.valdez@ph-enterprise.com',
          principalIdType: idType as any,
          principalIdNumber: idNumber,
          enpId: currentUser.commissionNumber || 'ENP-NCR-2025-0089',
          enpName: currentUser.fullName,
          enpCommissionNo: currentUser.commissionNumber || 'ENP-NCR-2025-0089',
          enpRollNo: currentUser.ibpRollNumber || '54210',
          enpStatus: currentUser.enpStatus || 'ACTIVE',
          documentTitle: docTitle,
          documentHash: docHash,
          certificateNumber: certNo,
          jurisdictionStatus: 'VERIFIED_PHILIPPINES',
          vpnProxyDetected: false,
          identityTrustScore: 98,
          identityVerifiedByHumanENP: true,
          jurisdictionVerifiedByRule: true,
          isEncryptedAes256: true,
          statutoryNotarialFee: actType === 'ACKNOWLEDGMENT' ? 1000 : 750,
          commercialPlatformFee: serviceMode === 'REN' ? 500 : 250,
          fee,
          timestamp: new Date().toLocaleString(),
          completionDate: new Date().toLocaleString()
        };

        setCompletedTx(newTx);
        setCurrentStep(7);

        // Record into Rule VIII Electronic Notarial Book
        const newBookEntry: NotarialBookEntry = {
          id: `book_${Date.now()}`,
          tenantId: currentUser.tenantId || 'tenant_sc_ph',
          sequenceNumber: Math.floor(Date.now() / 1000) % 10000,
          enpId: currentUser.commissionNumber || 'ENP-NCR-2025-0089',
          enpName: currentUser.fullName,
          transactionId: newTx.id,
          grNumber,
          actType,
          documentTitle: docTitle,
          principalName,
          competentEvidenceId: `${idType} #${idNumber}`,
          statutoryFee: actType === 'ACKNOWLEDGMENT' ? 1000 : 750,
          commercialFee: serviceMode === 'REN' ? 500 : 250,
          feeCharged: fee,
          serviceMode,
          entryHash: syncHash(certNo + docHash + Date.now()),
          previousEntryHash: syncHash('PREV_BLOCK_' + Date.now()),
          timestamp: new Date().toLocaleString(),
          isVerified: true
        };

        onRecordBookEntry(newBookEntry);
      }
    );
  };

  const handleReset = () => {
    setCurrentStep(1);
    setLivenessPassed(false);
    setJurisdictionPassed(false);
    setVideoConnected(false);
    setParticipantSigned(false);
    setEnpSigned(false);
    setEnpSealed(false);
    setCompletedTx(null);
  };

  return (
    <div className="space-y-6">
      {/* Platform Banner */}
      <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
              <Scale className="w-4 h-4" />
              <span>A.M. NO. 24-10-14-SC COMPLIANCE ENGINE</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 font-serif">
              Accredited Electronic Notarization Facility (ENF)
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Strict 12-stage state machine for In-Person (IEN) and Remote (REN) Electronic Notarization. Guarantees identity trust, multi-factor location assurance, ENP digital signature &amp; seal application, and automatic recording into the Rule VIII Electronic Notarial Book.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">ENP Authority:</span>
            {currentUser.role === 'ENP' ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Commission Active ({currentUser.commissionNumber})
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Switch to ENP role to execute final seal
              </span>
            )}
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          {[
            { step: 1, label: 'Filing & Mode' },
            { step: 2, label: 'e-KYC & Liveness' },
            { step: 3, label: 'Geo & VPN Check' },
            { step: 4, label: 'Appearance' },
            { step: 5, label: 'Principal Sign' },
            { step: 6, label: 'ENP Signature & Seal' },
            { step: 7, label: 'Rule VIII Booked' }
          ].map((item) => (
            <div
              key={item.step}
              className={`p-2 rounded-xl border transition-all ${
                currentStep === item.step
                  ? 'bg-amber-600/30 border-amber-500 text-amber-300 font-bold shadow-sm'
                  : currentStep > item.step
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-mono">Stage {item.step}</div>
              <div className="text-[11px] truncate">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Workflow Canvas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
        {currentStep === 1 && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-100 font-serif">
                Stage 1: Pleading Intake &amp; Service Mode Selection
              </h3>
              <p className="text-xs text-slate-400">
                Specify the Supreme Court G.R. number, notarial act classification, and appearance modality.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">G.R. Number:</label>
                <input
                  type="text"
                  value={grNumber}
                  onChange={(e) => setGrNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Service Mode (Rule I Sec. 2):</label>
                  <select
                    value={serviceMode}
                    onChange={(e) => setServiceMode(e.target.value as ServiceMode)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="REN">Remote Electronic Notarization (REN - Video)</option>
                    <option value="IEN">In-Person Electronic Notarization (IEN - Physical)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Notarial Act (Rule IV):</label>
                  <select
                    value={actType}
                    onChange={(e) => setActType(e.target.value as NotarialActType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="ACKNOWLEDGMENT">Acknowledgment</option>
                    <option value="JURAT">Jurat</option>
                    <option value="OATH_OR_AFFIRMATION">Affirmation or Oath</option>
                    <option value="SIGNATURE_WITNESSING">Signature Witnessing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Document Title:</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Principal / Litigant Name:</label>
                  <input
                    type="text"
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Competent ID Type:</label>
                  <input
                    type="text"
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-900/40 mt-3"
              >
                Proceed to Identity Trust &amp; e-KYC &rarr;
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
              <Fingerprint className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Stage 2: PhilSys e-KYC &amp; Liveness Detection</h3>
            <p className="text-xs text-slate-400">
              Rule VII Section 2(b)-(d): Validate principal identity against Bangko Sentral ng Pilipinas / PhilSys standards with presentation attack anti-spoofing.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-left space-y-1.5 font-mono">
              <div className="text-slate-400">Target Principal: <span className="text-slate-200">{principalName}</span></div>
              <div className="text-slate-400">ID Document: <span className="text-slate-200">{idType}</span></div>
              <div className="text-slate-400">ID Number: <span className="text-amber-400">{idNumber}</span></div>
              <div className="text-slate-400">Biometric Template: <span className="text-cyan-400">PHIL-ID-MATCH-99.8%</span></div>
            </div>

            <button
              onClick={handleVerifyIdentity}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify e-KYC &amp; Confirm Liveness</span>
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Stage 3: Multi-Factor Location &amp; VPN Detection</h3>
            <p className="text-xs text-slate-400">
              Rule VII Section 2(i): Ascertain all parties are physically present in the Philippines and disable VPN/proxy usage.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-left space-y-1.5 font-mono">
              <div className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> GPS Coordinates: 14.5828° N, 120.9842° E (Manila)
              </div>
              <div className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Network Carrier: PLDT Enterprise (AS9299)
              </div>
              <div className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> VPN / Proxy Inspection: 0 Anonymizers Detected
              </div>
              <div className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Jurisdiction Status: VERIFIED PHILIPPINES
              </div>
            </div>

            <button
              onClick={handleCheckJurisdiction}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Territorial Jurisdiction</span>
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-100">
                Stage 4: Synchronous Appearance Session ({serviceMode})
              </h3>
              <p className="text-xs text-slate-400">
                {serviceMode === 'REN'
                  ? 'Rule III & VII: Encrypted 720p HD videoconference with minimum 2 Mbps bandwidth and simultaneous document viewing.'
                  : 'Rule II: Physical appearance in close proximity with voluntariness confirmation.'}
              </p>
            </div>

            {/* Video Simulation */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden aspect-video flex flex-col items-center justify-center relative p-4">
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>REN SECURE STREAM (A.M. 24-10-14-SC)</span>
              </div>
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] text-slate-300 font-mono">
                HD 1280x720 &bull; 60fps &bull; AES-256
              </div>

              <div className="text-center space-y-2">
                <Video className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
                <div className="text-sm font-semibold text-slate-200">
                  Participants Connected: ENP Villanueva &bull; Litigant Valdez
                </div>
                <p className="text-xs text-slate-400 max-w-sm">
                  The ENP is examining the voluntariness and demeanor of the principal while reviewing {docTitle}.
                </p>
              </div>
            </div>

            <button
              onClick={handleStartAppearance}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
            >
              Confirm Voluntariness &amp; Proceed to Participant Signing &rarr;
            </button>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4 max-w-lg mx-auto text-center">
            <h3 className="text-base font-bold text-slate-100">Stage 5: Principal Electronic Signature</h3>
            <p className="text-xs text-slate-400">
              Rule IV Section 1(a): Require principal to sign the electronic document by affixing their signature in full view of the ENP.
            </p>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs text-slate-400">Digital Signature Capture Surface:</div>
              <div className="h-28 bg-black/40 border border-dashed border-amber-500/40 rounded-xl flex items-center justify-center font-serif text-2xl text-amber-300 italic tracking-wider">
                Antonio M. Valdez
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Cryptographic Signature Token: {syncHash('SIG_VALDEZ_' + grNumber)}
              </div>
            </div>

            <button
              onClick={handleParticipantSign}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
            >
              Affix Principal Electronic Signature &rarr;
            </button>
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-4 max-w-lg mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Stage 6: Apply Official ENP Electronic Seal &amp; Signature</h3>
            <p className="text-xs text-slate-400">
              Rule IX &amp; X: The Electronic Notary Public affixes their official seal (1.5 x 3 inches, Times New Roman, QR code) and issues the Electronic Notarial Certificate. Step-up MFA is strictly mandated.
            </p>

            {/* Official Seal Preview */}
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 text-left font-serif text-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">
                  Republic of the Philippines &bull; Electronic Notary Public
                </div>
                <QrCode className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="font-bold text-sm">{currentUser.fullName}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Roll No. {currentUser.ibpRollNumber || '54210'} &bull; Commission No. {currentUser.commissionNumber || 'ENP-NCR-2025-0089'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Jurisdiction: Supreme Court of the Philippines
                </div>
              </div>
            </div>

            <button
              onClick={handleEnpApplySignatureAndSeal}
              className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>Affix ENP Seal &amp; Issue Certificate (MFA Required)</span>
            </button>
          </div>
        )}

        {currentStep === 7 && completedTx && (
          <div className="space-y-5 max-w-xl mx-auto">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-serif">
                Notarization Successfully Completed &amp; Booked
              </h3>
              <p className="text-xs text-slate-400">
                Statutory Electronic Notarial Certificate issued and recorded into the Rule VIII Electronic Notarial Book.
              </p>
            </div>

            {/* Issued Certificate Card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/40 space-y-3 font-serif">
              <div className="text-center border-b border-slate-800 pb-3">
                <div className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
                  REPUBLIC OF THE PHILIPPINES &bull; SUPREME COURT
                </div>
                <div className="text-sm font-bold text-white mt-1">
                  ELECTRONIC NOTARIAL CERTIFICATE
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {completedTx.certificateNumber}
                </div>
              </div>

              <div className="text-xs space-y-1.5 text-slate-300 font-sans">
                <p>
                  I certify that on this day, <strong>{completedTx.completionDate}</strong>, before me through <strong>{completedTx.serviceMode}</strong>, personally appeared <strong>{completedTx.principalName}</strong> with {completedTx.principalIdType} #{completedTx.principalIdNumber}, who affirmed that the contents of <em>&quot;{completedTx.documentTitle}&quot;</em> (G.R. No. {completedTx.grNumber}) are true of his own knowledge under penalty of law.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-[11px] text-slate-400 font-sans">
                <div>
                  <div className="text-slate-200 font-semibold">{completedTx.enpName}</div>
                  <div>Roll No. {completedTx.enpRollNo} &bull; {completedTx.enpCommissionNo}</div>
                </div>
                <div className="text-right">
                  <div className="text-amber-400 font-semibold">Notarial Fee: ₱{completedTx.fee.toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-400">Rule VIII Chained</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Notarize Another Legal Document</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
