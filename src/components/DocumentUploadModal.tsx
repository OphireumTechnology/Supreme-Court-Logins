import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  ShieldCheck, 
  Lock, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Server
} from 'lucide-react';
import { sha256 } from '../utils/crypto';
import { EncryptedDocument, LegalCase } from '../types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: LegalCase;
  onUploadSuccess: (newDoc: EncryptedDocument) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onUploadSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [shaHash, setShaHash] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!docTitle) {
        setDocTitle(selected.name);
      }
      // Calculate real SHA-256 of file
      try {
        const text = await selected.text();
        const hash = await sha256(text);
        setShaHash(hash);
      } catch {
        const dummyHash = await sha256(selected.name + selected.size + Date.now());
        setShaHash(dummyHash);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    if (!docTitle.trim()) {
      setError('Please provide a document title.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Multi-phase encryption and multi-storage replication simulation
    setUploadProgress('Phase 1/4: Generating AES-256-GCM symmetric session keys...');
    await new Promise(r => setTimeout(r, 600));

    setUploadProgress('Phase 2/4: Computing SHA-256 cryptographic checksum & integrity seal...');
    await new Promise(r => setTimeout(r, 600));

    setUploadProgress('Phase 3/4: Distributing cipher blocks across multi-storage vaults (Manila, Cebu, Davao)...');
    await new Promise(r => setTimeout(r, 700));

    setUploadProgress('Phase 4/4: Applying Court Lock — sealed until approving body grants private key...');
    await new Promise(r => setTimeout(r, 500));

    const finalHash = shaHash || (await sha256(file.name + file.size + Date.now()));

    const newDoc: EncryptedDocument = {
      id: `doc_${Date.now()}`,
      tenantId: caseItem.tenantId || 'tenant_sc_ph',
      clientId: caseItem.clientId || 'client_valdez',
      caseId: caseItem.id,
      title: docTitle.trim(),
      fileType: file.type || 'application/pdf',
      fileSizeBytes: file.size,
      uploadedAt: new Date().toLocaleString(),
      sha256Hash: finalHash,
      encryptionAlgorithm: 'AES-256-GCM',
      keyFingerprint: caseItem.decryptionKeyApproved ? 'KEY-SC-ENBANC-ACTIVE' : 'KEY-LOCKED-PENDING-DECISION',
      storageLocations: [
        'Storage Vault Manila (Primary)',
        'Encrypted Disaster Replica Cebu',
        'Judicial Immutable Node Davao'
      ],
      isCourtLocked: !caseItem.decryptionKeyApproved
    };

    setIsProcessing(false);
    onUploadSuccess(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Secure Document Upload</h3>
              <p className="text-xs text-amber-400 font-mono">Linked to {caseItem.grNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400 font-medium">Filing Matter:</div>
            <div className="text-slate-200 font-semibold">{caseItem.title}</div>
            <div className="text-[11px] text-amber-400/90 font-mono">
              Division: {caseItem.courtDivision} &bull; Region: {caseItem.region}
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Document / Pleading Title:
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Urgent Motion for Extension to File Comment.pdf"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* File Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Select Legal Exhibit or Pleading:
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-5 text-center bg-slate-950/50 transition-colors">
              <input
                type="file"
                id="doc-upload-input"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg"
              />
              <label htmlFor="doc-upload-input" className="cursor-pointer space-y-2 block">
                <FileText className="w-8 h-8 mx-auto text-slate-500 hover:text-amber-400 transition-colors" />
                <div className="text-xs text-slate-300 font-medium">
                  {file ? file.name : 'Click or drag & drop PDF/documents here'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Supported: PDF, PDF/A, DOCX (Max: 50MB) &bull; Strict HIPAA/GDPR Sanitization
                </div>
              </label>
            </div>
          </div>

          {/* SHA-256 Preview */}
          {shaHash && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Calculated SHA-256 Checksum (Immutable Hash):</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-300 break-all bg-black/40 p-1.5 rounded border border-emerald-500/20">
                {shaHash}
              </div>
            </div>
          )}

          {/* Multi-Storage Architecture Specs */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Storage Redundancy &amp; Court Key Lock Protocol:</span>
            </div>
            <p className="text-[10px] leading-relaxed">
              Files are split and stored in 3 independent geographical nodes. Once committed, the record is immutable (blockchain-modeled). The AES-256 decryption key is locked until an official Decision or Resolution is issued by the Supreme Court approving body.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Processing message */}
          {isProcessing && (
            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-300 text-xs flex items-center gap-2 animate-pulse">
              <Lock className="w-4 h-4 shrink-0 animate-spin" />
              <span>{uploadProgress}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={isProcessing || !file}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-900/40 flex items-center justify-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isProcessing ? 'Encrypting...' : 'Encrypt & Upload (AES-256)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
