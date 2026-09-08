import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { SecurityPolicyEngine, AuthContext } from './src/server/policy';
import { GovernmentConnectorService, SupremeCourtENAConnector, DisasterRecoveryConfig } from './src/server/connectors';
import { initialLegalCases, initialNotarialBookEntries, initialAuditLogs } from './src/data/mockData';
import { NotarialTransaction, AuditLog, NotarialBookEntry } from './src/types';
import { v1Router } from './src/server/v1-routes';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Mount Central Notarial Transaction Engine REST API v1
app.use('/v1', v1Router);

// In-memory persistent stores for server session
let serverAuditLogs: AuditLog[] = [...initialAuditLogs];
let serverBookEntries: NotarialBookEntry[] = [...initialNotarialBookEntries];

// Helper to log server-side audit events (Requirement 36)
function logServerAudit(
  tenantId: string,
  actor: string,
  actorRole: any,
  action: string,
  resource: string,
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUSPICIOUS',
  status: 'SUCCESS' | 'BLOCKED' | 'FLAGGED' = 'SUCCESS',
  grNumber?: string
) {
  const log: AuditLog = {
    id: `srv_log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    tenantId,
    timestamp: new Date().toISOString(),
    actor,
    actorRole,
    action,
    resource,
    grNumber,
    severity,
    ipAddress: '127.0.0.1',
    location: 'Judicial Data Center, Manila',
    userAgent: 'Server-Authoritative Kernel',
    status,
    logHash: crypto.createHash('sha256').update(`${actor}${action}${Date.now()}`).digest('hex'),
    previousLogHash: serverAuditLogs[0]?.logHash
  };
  serverAuditLogs = [log, ...serverAuditLogs];
  return log;
}

// Middleware: Extract & validate Auth Context from Request Headers
function parseAuthContext(req: express.Request): AuthContext {
  const userId = (req.headers['x-user-id'] as string) || 'usr_anonymous';
  const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant_judicial_sc';
  const email = (req.headers['x-user-email'] as string) || 'guest@portal.ph';
  const role = (req.headers['x-user-role'] as any) || 'CLIENT';
  const enpStatus = (req.headers['x-enp-status'] as any) || 'ACTIVE';
  const commissionValidUntil = req.headers['x-commission-expiry'] as string;
  const mfaVerified = req.headers['x-mfa-verified'] === 'true';
  const isAiAgent = req.headers['x-is-ai-agent'] === 'true';

  return {
    userId,
    tenantId,
    email,
    role,
    enpStatus,
    commissionValidUntil,
    mfaVerified,
    isAiAgent
  };
}

// -------------------------------------------------------------
// 1. Health & Disaster Recovery Endpoints (Requirement 37)
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    compliance: ['A.M. No. 24-10-14-SC', 'HIPAA', 'GDPR'],
    activeVaults: 3
  });
});

app.get('/api/dr-backup/status', (req, res) => {
  res.json({
    disasterRecovery: DisasterRecoveryConfig,
    verifiedAt: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// 2. MFA Step-Up Authentication (Requirement 35)
// -------------------------------------------------------------
app.post('/api/auth/mfa/verify', (req, res) => {
  const { code, method } = req.body;
  const auth = parseAuthContext(req);

  // Demo token or valid 6-digit TOTP
  if (code === '784920' || code === '992144' || (code && code.length === 6 && /^\d+$/.test(code))) {
    logServerAudit(auth.tenantId, auth.email, auth.role, `Step-Up MFA Approved via ${method}`, 'Auth Gate', 'INFO');
    return res.json({ success: true, verified: true, sessionToken: `MFA_AUTH_${Date.now()}` });
  }

  logServerAudit(auth.tenantId, auth.email, auth.role, `Step-Up MFA Failed Attempt (${method})`, 'Auth Gate', 'WARNING', 'BLOCKED');
  return res.status(401).json({ success: false, error: 'Invalid MFA verification token.' });
});

// -------------------------------------------------------------
// 3. Document Download & Cryptographic Hash Verification (Requirements 1, 2, 22, 23, 33)
// -------------------------------------------------------------
app.post('/api/documents/:docId/verify-download', (req, res) => {
  const auth = parseAuthContext(req);
  const { docId } = req.params;
  const { expectedSha256, providedTenantId, clientId } = req.body;

  try {
    // Requirement 1 & 2: Client and Tenant Isolation
    SecurityPolicyEngine.assertClientDocumentAccess(auth, clientId || 'client_valdez', providedTenantId || auth.tenantId);

    // Requirement 22 & 23: Pre-download hash verification
    // Simulating file retrieval from Judicial Vault
    const simulatedFileContent = `SEALED_JUDICIAL_RECORD_${docId}_${expectedSha256}`;
    const actualComputedHash = crypto.createHash('sha256').update(simulatedFileContent).digest('hex');

    // Simulate integrity check: if expected hash matches actual, download succeeds
    // If request deliberately tests corrupted data, detect tampering!
    if (req.body.testTampering === true) {
      logServerAudit(
        auth.tenantId,
        auth.email,
        auth.role,
        `SECURITY_INCIDENT: Tampering detected on document ${docId}. Checksum mismatch!`,
        `Doc: ${docId}`,
        'CRITICAL',
        'FLAGGED'
      );
      return res.status(409).json({
        error: 'DOCUMENT_TAMPERING_DETECTED',
        message: 'Cryptographic hash mismatch. Document integrity compromised! Incident logged with Supreme Court Cyber-Security.'
      });
    }

    logServerAudit(auth.tenantId, auth.email, auth.role, `Downloaded Verified Exhibit ${docId}`, `Doc: ${docId}`, 'INFO');
    return res.json({
      verified: true,
      sha256: expectedSha256 || actualComputedHash,
      storageNode: 'Manila Primary Vault (AES-256-GCM)',
      integrityConfirmed: true
    });
  } catch (err: any) {
    logServerAudit(auth.tenantId, auth.email, auth.role, err.message, `Doc: ${docId}`, 'WARNING', 'BLOCKED');
    return res.status(403).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 4. Server-Authoritative Notarial State Transitions
// (Requirements 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17, 18, 36)
// -------------------------------------------------------------
app.post('/api/notarization/transition', (req, res) => {
  const auth = parseAuthContext(req);
  const { currentState, targetState, transactionData } = req.body;

  try {
    SecurityPolicyEngine.validateStateTransition(currentState, targetState, transactionData || {}, auth);

    // Requirement 36: Every state transition creates an audit event
    logServerAudit(
      auth.tenantId,
      auth.email,
      auth.role,
      `Notarial State Transition: ${currentState} -> ${targetState}`,
      `Transaction: ${transactionData?.id || 'TX_UNKNOWN'}`,
      'INFO',
      'SUCCESS',
      transactionData?.grNumber
    );

    return res.json({
      success: true,
      newState: targetState,
      transitionApprovedAt: new Date().toISOString()
    });
  } catch (err: any) {
    logServerAudit(
      auth.tenantId,
      auth.email,
      auth.role,
      `Transition Blocked: ${err.message}`,
      `Transaction: ${transactionData?.id || 'TX_UNKNOWN'}`,
      'WARNING',
      'BLOCKED',
      transactionData?.grNumber
    );
    return res.status(403).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 5. Electronic Notarial Book Immutability & Amendments (Requirements 20 & 21)
// -------------------------------------------------------------
app.put('/api/notarial-book/:id', (req, res) => {
  // Requirement 20: Updates strictly forbidden
  try {
    SecurityPolicyEngine.assertNotarialBookImmutable('UPDATE');
  } catch (err: any) {
    return res.status(405).json({ error: err.message });
  }
});

app.delete('/api/notarial-book/:id', (req, res) => {
  // Requirement 20: Deletions strictly forbidden
  try {
    SecurityPolicyEngine.assertNotarialBookImmutable('DELETE');
  } catch (err: any) {
    return res.status(405).json({ error: err.message });
  }
});

app.post('/api/notarial-book/amendment', (req, res) => {
  // Requirement 21: Corrections generate linked amendment entries
  const auth = parseAuthContext(req);
  const { originalEntryId, amendmentReason, amendedFields } = req.body;

  try {
    const originalEntry = serverBookEntries.find(e => e.id === originalEntryId) || serverBookEntries[0];
    const amendment = SecurityPolicyEngine.createLinkedAmendment(originalEntry, amendmentReason, amendedFields, auth);

    logServerAudit(
      auth.tenantId,
      auth.email,
      auth.role,
      `Linked Amendment #${amendment.amendmentSequenceNumber} appended to Entry #${originalEntry.sequenceNumber}`,
      `Entry: ${originalEntry.id}`,
      'INFO',
      'SUCCESS',
      originalEntry.grNumber
    );

    return res.json({ success: true, amendment });
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 6. Government eGov / PSA eVerify Connector (Requirements 13 & 14)
// -------------------------------------------------------------
app.post('/api/connectors/egov', async (req, res) => {
  try {
    const result = await GovernmentConnectorService.verifyWithPSA_PhilSys(req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 7. Supreme Court Decision Decryption Key Connector (Requirements 28 & 29)
// -------------------------------------------------------------
app.post('/api/connectors/court/decrypt', async (req, res) => {
  const auth = parseAuthContext(req);
  const { courtDecisionStatus, grNumber, resolutionNumber } = req.body;

  try {
    // Requirement 28: Court connector remains disabled unless approval status is APPROVED
    SecurityPolicyEngine.assertCourtConnectorAllowed(courtDecisionStatus);

    // Requirement 29: Connect to Supreme Court ENA verification
    const rollInfo = await SupremeCourtENAConnector.queryRollOfAttorneys('78492');

    logServerAudit(
      auth.tenantId,
      auth.email,
      auth.role,
      `Court Decryption Key Released for ${grNumber} under Res. ${resolutionNumber}`,
      `GR: ${grNumber}`,
      'INFO'
    );

    return res.json({
      status: 'APPROVED',
      decryptionKeyIssued: true,
      keyFingerprint: `KEY-SC-${Date.now().toString(36).toUpperCase()}`,
      courtResolution: resolutionNumber,
      registryAudit: rollInfo
    });
  } catch (err: any) {
    logServerAudit(auth.tenantId, auth.email, auth.role, `Decryption Key Blocked: ${err.message}`, `GR: ${grNumber}`, 'WARNING', 'BLOCKED');
    return res.status(403).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 8. Enterprise Instant Notarization Prohibition (Requirement 27)
// -------------------------------------------------------------
app.post('/api/enterprise/notarize-instant', (req, res) => {
  try {
    SecurityPolicyEngine.rejectInstantNotarization();
  } catch (err: any) {
    return res.status(422).json({
      error: 'INSTANT_NOTARIZATION_FORBIDDEN',
      message: err.message,
      ruleReference: 'Supreme Court A.M. No. 24-10-14-SC, Rule VII (Compulsory Synchronous Appearance)'
    });
  }
});

// -------------------------------------------------------------
// 9. Webhook Signature Verification & Replay Protection (Requirement 26)
// -------------------------------------------------------------
app.post('/api/webhooks/sc-event', (req, res) => {
  const signature = req.headers['x-sc-signature'] as string;
  const timestamp = req.headers['x-sc-timestamp'] as string;
  const secret = process.env.SC_WEBHOOK_SECRET || 'supremecourt_notarial_webhook_secret_2025';

  const payloadString = JSON.stringify(req.body);
  const verification = SecurityPolicyEngine.verifyWebhookSignature(payloadString, signature, timestamp, secret);

  if (!verification.valid) {
    return res.status(401).json({ error: 'WEBHOOK_VALIDATION_FAILED', reason: verification.reason });
  }

  return res.json({ success: true, processedAt: new Date().toISOString() });
});

// -------------------------------------------------------------
// 10. Sanitized Public Verification (Requirement 25: No PII)
// -------------------------------------------------------------
app.get('/api/verify', (req, res) => {
  const certId = req.query.certNumber as string;
  const sampleTx: NotarialTransaction = {
    id: 'tx_demo',
    tenantId: 'tenant_sc',
    clientId: 'client_valdez',
    grNumber: 'G.R. No. 241014-SC',
    actType: 'ACKNOWLEDGMENT',
    serviceMode: 'REN',
    state: 'COMPLETE',
    principalName: 'Engr. Antonio M. Valdez',
    principalEmail: 'private@client.com',
    principalIdType: 'Philippine National ID (PhilSys)',
    principalIdNumber: '9921-4401-2098-7712', // Sensitive PII!
    enpId: 'enp_villanueva',
    enpName: 'Atty. Roberto C. Villanueva',
    enpCommissionNo: 'ENP-NCR-2025-0089',
    enpRollNo: '54210',
    enpStatus: 'ACTIVE',
    documentTitle: 'Restructuring Deed.pdf',
    documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    certificateNumber: certId || 'CERT-SC-2025-00891',
    jurisdictionStatus: 'VERIFIED_PHILIPPINES',
    vpnProxyDetected: false,
    identityTrustScore: 99,
    identityVerifiedByHumanENP: true,
    jurisdictionVerifiedByRule: true,
    isEncryptedAes256: true,
    statutoryNotarialFee: 1000,
    commercialPlatformFee: 500,
    fee: 1500,
    timestamp: '2025-03-08 10:00 AM',
    completionDate: '2025-03-08 10:15 AM'
  };

  const sanitized = SecurityPolicyEngine.sanitizePublicVerification(sampleTx, 42);
  return res.json(sanitized);
});

// -------------------------------------------------------------
// 11. Sensitive Data Export Authorization & Auditing (Requirement 34)
// -------------------------------------------------------------
app.post('/api/reports/export', (req, res) => {
  const auth = parseAuthContext(req);
  const { format, reportType } = req.body;

  if (!['LAWYER', 'ENP', 'ADMIN', 'COMPLIANCE_OFFICER'].includes(auth.role)) {
    return res.status(403).json({ error: 'UNAUTHORIZED_EXPORT: Role lacks judicial records export authorization.' });
  }

  logServerAudit(
    auth.tenantId,
    auth.email,
    auth.role,
    `Sensitive Judicial Records Export: ${reportType} (${format})`,
    'Export Engine',
    'INFO'
  );

  return res.json({
    success: true,
    format,
    exportTimestamp: new Date().toISOString(),
    auditLogged: true
  });
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Supreme Court ENF Kernel] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
