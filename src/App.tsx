import React, { useState } from 'react';
import { 
  UserProfile, 
  LegalCase, 
  CourtKeyDecision, 
  NotarialBookEntry, 
  AuditLog, 
  SecureMessage, 
  NotificationItem, 
  EncryptedDocument 
} from './types';
import { 
  initialUsers, 
  initialLegalCases, 
  initialCourtKeyDecisions, 
  initialNotarialBookEntries, 
  initialAuditLogs, 
  initialSecureMessages, 
  initialNotifications 
} from './data/mockData';
import { Header, ActiveTab } from './components/Header';
import { CaseManagement } from './components/CaseManagement';
import { CourtKeyDecisions } from './components/CourtKeyDecisions';
import { NotarialFacility } from './components/NotarialFacility';
import { NotarialBookViewer } from './components/NotarialBookViewer';
import { AuditSecurityDashboard } from './components/AuditSecurityDashboard';
import { SecureMessaging } from './components/SecureMessaging';
import { NotificationsCenter } from './components/NotificationsCenter';
import { DocumentVerification } from './components/DocumentVerification';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { MfaModal } from './components/MfaModal';
import { EnpWorkQueue } from './components/EnpWorkQueue';
import { ClientTransactionTimeline } from './components/ClientTransactionTimeline';
import { ProviderHealthDashboard } from './components/ProviderHealthDashboard';
import { Footer } from './components/Footer';
import { syncHash } from './utils/crypto';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('CASES');
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialUsers[1]); // Default to ENP
  const [allUsers] = useState<UserProfile[]>(initialUsers);

  // Core Data States
  const [cases, setCases] = useState<LegalCase[]>(initialLegalCases);
  const [decisions, setDecisions] = useState<CourtKeyDecision[]>(initialCourtKeyDecisions);
  const [bookEntries, setBookEntries] = useState<NotarialBookEntry[]>(initialNotarialBookEntries);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [messages, setMessages] = useState<SecureMessage[]>(initialSecureMessages);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Modals state
  const [uploadModalState, setUploadModalState] = useState<{ isOpen: boolean; caseId: string | null }>({
    isOpen: false,
    caseId: null
  });

  const [mfaModalState, setMfaModalState] = useState<{
    isOpen: boolean;
    actionTitle: string;
    onSuccess: () => void;
  }>({
    isOpen: false,
    actionTitle: '',
    onSuccess: () => {}
  });

  const [selectedCaseForMessaging, setSelectedCaseForMessaging] = useState<string | null>(null);

  // Helpers to add Audit Logs
  const addAuditLog = (
    action: string,
    resource: string,
    severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUSPICIOUS',
    grNumber?: string,
    status: 'SUCCESS' | 'BLOCKED' | 'FLAGGED' = 'SUCCESS'
  ) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      tenantId: currentUser.tenantId || 'tenant_sc_ph',
      timestamp: new Date().toLocaleString(),
      actor: currentUser.email,
      actorRole: currentUser.role,
      action,
      resource,
      grNumber,
      severity,
      ipAddress: '120.29.74.19',
      location: `${currentUser.region}, Philippines`,
      userAgent: 'Mozilla/5.0 JudicialWorkstation/2025 (Supreme Court)',
      status,
      logHash: syncHash(`${currentUser.email}${action}${Date.now()}`),
      previousLogHash: auditLogs[0]?.logHash
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Switch User & Role
  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    addAuditLog(
      `Role Persona Switched to ${user.role} (${user.fullName})`,
      'Authentication Session Context',
      'INFO'
    );
  };

  // Open Document Upload
  const handleOpenUploadModal = (caseId: string) => {
    setUploadModalState({ isOpen: true, caseId });
  };

  // Upload Success
  const handleUploadSuccess = (newDoc: EncryptedDocument) => {
    if (!uploadModalState.caseId) return;
    const targetCaseId = uploadModalState.caseId;

    setCases(prev => prev.map(c => {
      if (c.id === targetCaseId) {
        return {
          ...c,
          documentCount: c.documentCount + 1,
          documents: [newDoc, ...c.documents]
        };
      }
      return c;
    }));

    const matchedCase = cases.find(c => c.id === targetCaseId);
    addAuditLog(
      `Encrypted Document Sealed: "${newDoc.title}" (AES-256 Multi-Storage)`,
      newDoc.title,
      'INFO',
      matchedCase?.grNumber
    );
  };

  // Trigger Court Key Request Navigation
  const handleRequestCourtKey = (caseItem: LegalCase) => {
    setActiveTab('COURT_KEYS');
  };

  // Approve Court Key Decision
  const handleApproveDecision = (decisionId: string) => {
    const targetDec = decisions.find(d => d.id === decisionId);
    if (!targetDec) return;

    setDecisions(prev => prev.map(d => {
      if (d.id === decisionId) {
        return { ...d, status: 'APPROVED' };
      }
      return d;
    }));

    // Unlock corresponding case documents!
    setCases(prev => prev.map(c => {
      if (c.grNumber === targetDec.grNumber) {
        return {
          ...c,
          decryptionKeyApproved: true,
          documents: c.documents.map(doc => ({
            ...doc,
            isCourtLocked: false
          }))
        };
      }
      return c;
    }));

    addAuditLog(
      `Court Decryption Key Released by Approving Body (${targetDec.approvingBody}) for ${targetDec.grNumber}`,
      targetDec.resolutionNumber,
      'INFO',
      targetDec.grNumber
    );
  };

  // New Petition for Court Key
  const handleNewPetition = (petitionData: Omit<CourtKeyDecision, 'id' | 'status' | 'keyFingerprint'>) => {
    const newDecision: CourtKeyDecision = {
      ...petitionData,
      id: `dec_${Date.now()}`,
      status: 'PENDING_PETITION',
      keyFingerprint: `KEY-SC-${Date.now().toString(36).toUpperCase()}`
    };
    setDecisions(prev => [newDecision, ...prev]);

    addAuditLog(
      `Urgent Petition Filed for Court Decryption Key on ${newDecision.grNumber}`,
      newDecision.resolutionNumber,
      'WARNING',
      newDecision.grNumber
    );
  };

  // Record Notarial Book Entry
  const handleRecordBookEntry = (entry: NotarialBookEntry) => {
    setBookEntries(prev => [entry, ...prev]);

    addAuditLog(
      `Rule VIII Notarial Book Entry #${entry.sequenceNumber} Recorded (Hash Chain Append)`,
      entry.documentTitle,
      'INFO',
      entry.grNumber
    );
  };

  // Send Encrypted Message
  const handleSendMessage = (msg: Omit<SecureMessage, 'id' | 'sentAt' | 'isRead'>) => {
    const newMsg: SecureMessage = {
      ...msg,
      id: `msg_${Date.now()}`,
      sentAt: new Date().toLocaleString(),
      isRead: false
    };
    setMessages(prev => [...prev, newMsg]);

    addAuditLog(
      `Encrypted Counsel-Client Message Dispatched on ${msg.grNumber}`,
      msg.grNumber,
      'INFO',
      msg.grNumber
    );
  };

  // Send Notification
  const handleSendNotification = (alertData: Omit<NotificationItem, 'id' | 'sentAt' | 'status'>) => {
    const newNotif: NotificationItem = {
      ...alertData,
      id: `notif_${Date.now()}`,
      status: 'SENT',
      sentAt: new Date().toLocaleString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    addAuditLog(
      `Automated Judicial Reminder Dispatched via ${newNotif.channel} to ${newNotif.recipientEmail}`,
      newNotif.subject,
      'INFO',
      newNotif.grNumber
    );
  };

  // Simulate Suspicious Attempt
  const handleSimulateSuspiciousAttempt = () => {
    const rogueIp = '185.220.101.45';
    const targetCase = cases[1] || cases[0];

    const newLog: AuditLog = {
      id: `log_breach_${Date.now()}`,
      tenantId: 'tenant_sc_ph',
      timestamp: new Date().toLocaleString(),
      actor: 'unauthorized_relay@anonymizer.tor',
      actorRole: 'CLIENT',
      action: 'Unauthorized Key Extraction & Bulk Storage Download Attempt',
      resource: 'Judicial Vault Alpha (AES-256 Encrypted Store)',
      grNumber: targetCase.grNumber,
      severity: 'CRITICAL',
      ipAddress: rogueIp,
      location: 'Frankfurt, Germany (Known Tor Exit Relay)',
      userAgent: 'curl/7.88.1 (Non-Browser Scripted Agent)',
      status: 'BLOCKED',
      logHash: syncHash(`SUSPICIOUS_${Date.now()}_${rogueIp}`),
      previousLogHash: auditLogs[0]?.logHash
    };

    setAuditLogs(prev => [newLog, ...prev]);

    // Dispatch automated security alert
    const secNotif: NotificationItem = {
      id: `notif_sec_${Date.now()}`,
      tenantId: 'tenant_sc_ph',
      recipientEmail: 'admin.security@supremecourt.gov.ph',
      recipientPhone: '+63 917 888 9900',
      type: 'SECURITY_ALERT',
      channel: 'DUAL',
      subject: `CRITICAL ALERT: Unauthorized Key Unlock Attempt Blocked on ${targetCase.grNumber}`,
      message: `Multiple unauthorized decryption calls from Tor exit node ${rogueIp} targeting sealed files on ${targetCase.grNumber}. Origin blocked automatically by firewall.`,
      grNumber: targetCase.grNumber,
      status: 'SENT',
      sentAt: new Date().toLocaleString(),
      priority: 'URGENT'
    };

    setNotifications(prev => [secNotif, ...prev]);
  };

  // Trigger MFA helper
  const triggerMfa = (actionTitle: string, onSuccess: () => void) => {
    setMfaModalState({
      isOpen: true,
      actionTitle,
      onSuccess: () => {
        addAuditLog(`Step-Up MFA Verification Succeeded for: ${actionTitle}`, 'MFA Gate', 'INFO');
        onSuccess();
      }
    });
  };

  // Case Messaging Selection
  const handleSelectCaseForMessaging = (caseItem: LegalCase) => {
    setSelectedCaseForMessaging(caseItem.id);
    setActiveTab('MESSAGING');
  };

  // Start Notarization for Case
  const handleStartNotarization = (caseItem: LegalCase) => {
    setActiveTab('NOTARIZATION');
  };

  // Request MFA unlock for a document
  const handleRequestMfaUnlock = (doc: EncryptedDocument, caseItem: LegalCase) => {
    triggerMfa(
      `Decrypt & Download Sealed Document "${doc.title}" (AES-256 GCM) on ${caseItem.grNumber}`,
      () => {
        addAuditLog(
          `Decrypted & Downloaded Exhibit "${doc.title}" (SHA-256 Verified)`,
          doc.title,
          'INFO',
          caseItem.grNumber
        );
        alert(`Authentication Successful! Document "${doc.title}" decrypted from Primary Vault Manila and verified against SHA-256 checksum (${doc.sha256Hash.slice(0, 16)}...).`);
      }
    );
  };

  const currentUploadCase = cases.find(c => c.id === uploadModalState.caseId) || cases[0];
  const activeAlerts = auditLogs.filter(l => l.severity === 'CRITICAL' || l.severity === 'SUSPICIOUS').length;
  const unreadMessages = messages.filter(m => !m.isRead).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={handleSelectUser}
        unreadMessagesCount={unreadMessages}
        activeAlertsCount={activeAlerts}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'CASES' && (
          <CaseManagement
            cases={cases}
            currentUser={currentUser}
            onOpenUploadModal={handleOpenUploadModal}
            onRequestCourtKey={handleRequestCourtKey}
            onStartNotarization={handleStartNotarization}
            onSelectCaseForMessaging={handleSelectCaseForMessaging}
            onRequestMfaUnlock={handleRequestMfaUnlock}
          />
        )}

        {activeTab === 'ENP_QUEUE' && (
          <EnpWorkQueue
            currentUser={currentUser}
          />
        )}

        {activeTab === 'CLIENT_TIMELINE' && (
          <ClientTransactionTimeline
            currentUser={currentUser}
          />
        )}

        {activeTab === 'NOTARIZATION' && (
          <NotarialFacility
            currentUser={currentUser}
            onRecordBookEntry={handleRecordBookEntry}
            onTriggerMfa={triggerMfa}
          />
        )}

        {activeTab === 'NOTARIAL_BOOK' && (
          <NotarialBookViewer
            entries={bookEntries}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'COURT_KEYS' && (
          <CourtKeyDecisions
            decisions={decisions}
            cases={cases}
            currentUser={currentUser}
            onApproveDecision={handleApproveDecision}
            onNewPetition={handleNewPetition}
            onTriggerMfa={triggerMfa}
          />
        )}

        {activeTab === 'MESSAGING' && (
          <SecureMessaging
            messages={messages}
            cases={cases}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            selectedCaseId={selectedCaseForMessaging}
          />
        )}

        {activeTab === 'AUDIT_SECURITY' && (
          <AuditSecurityDashboard
            logs={auditLogs}
            currentUser={currentUser}
            onSimulateSuspiciousAttempt={handleSimulateSuspiciousAttempt}
          />
        )}

        {activeTab === 'NOTIFICATIONS' && (
          <NotificationsCenter
            notifications={notifications}
            cases={cases}
            onSendAutomatedAlert={handleSendNotification}
          />
        )}

        {activeTab === 'PROVIDER_HEALTH' && (
          <ProviderHealthDashboard />
        )}

        {activeTab === 'VERIFICATION' && (
          <DocumentVerification
            bookEntries={bookEntries}
            cases={cases}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <Footer />

      {/* Document Upload Modal */}
      {uploadModalState.isOpen && currentUploadCase && (
        <DocumentUploadModal
          isOpen={uploadModalState.isOpen}
          onClose={() => setUploadModalState({ isOpen: false, caseId: null })}
          caseItem={currentUploadCase}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* MFA Verification Gate Modal */}
      {mfaModalState.isOpen && (
        <MfaModal
          isOpen={mfaModalState.isOpen}
          onClose={() => setMfaModalState({ isOpen: false, actionTitle: '', onSuccess: () => {} })}
          onSuccess={mfaModalState.onSuccess}
          actionTitle={mfaModalState.actionTitle}
          userEmail={currentUser.email}
        />
      )}
    </div>
  );
}
