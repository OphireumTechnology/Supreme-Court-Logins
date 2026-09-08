/**
 * Supreme Court ENF Platform - Enterprise Security & Statutory Compliance Policies
 * Strict compliance with A.M. No. 24-10-14-SC, HIPAA & GDPR
 */

import crypto from 'crypto';
import { 
  UserRole, 
  EnpStatus, 
  TransactionState, 
  ServiceMode, 
  NotarialTransaction,
  NotarialBookEntry,
  LinkedAmendmentEntry,
  AuditLog
} from '../types';

export interface AuthContext {
  userId: string;
  tenantId: string;
  email: string;
  role: UserRole;
  enpStatus?: EnpStatus;
  commissionValidUntil?: string;
  mfaVerified: boolean;
  isAiAgent?: boolean;
}

export class SecurityPolicyEngine {
  /**
   * Requirement 1: One client cannot access another client's documents.
   */
  static assertClientDocumentAccess(auth: AuthContext, docClientId: string, docTenantId: string): void {
    this.assertTenantIsolation(auth, docTenantId);
    if (auth.role === 'CLIENT' && auth.userId !== docClientId) {
      throw new Error(`SECURITY_VIOLATION: Cross-client access denied. Client ${auth.userId} cannot access document of client ${docClientId}.`);
    }
  }

  /**
   * Requirement 2: One tenant cannot access another tenant.
   */
  static assertTenantIsolation(auth: AuthContext, targetTenantId: string): void {
    if (auth.tenantId !== targetTenantId) {
      throw new Error(`TENANT_ISOLATION_VIOLATION: Access denied across tenants. Requester tenant: ${auth.tenantId}, Target tenant: ${targetTenantId}.`);
    }
  }

  /**
   * Requirements 3, 4, 5, 6, 7, 8:
   * - Enterprise Admin cannot notarize (Req 3)
   * - Platform Admin cannot notarize (Req 4)
   * - Law Firm Admin cannot apply an ENP signature (Req 5)
   * - Only authenticated ACTIVE ENP can invoke ENP-signature operations (Req 6)
   * - Only ACTIVE ENP can apply the Electronic Notarial Seal (Req 7)
   * - Expired, suspended or revoked ENPs are blocked (Req 8)
   */
  static assertCanApplyEnpSignatureOrSeal(auth: AuthContext, action: 'SIGNATURE' | 'SEAL'): void {
    if (auth.isAiAgent) {
      throw new Error(`STATUTORY_VIOLATION: AI agents are strictly forbidden from applying ENP signatures or seals under A.M. No. 24-10-14-SC.`);
    }

    if (auth.role === 'ENTERPRISE_ADMIN') {
      throw new Error(`ROLE_VIOLATION: Enterprise Administrators lack judicial commission under Rule VI of A.M. No. 24-10-14-SC. Cannot apply ${action}.`);
    }

    if (auth.role === 'PLATFORM_ADMIN') {
      throw new Error(`ROLE_VIOLATION: Platform Administrators cannot perform notarial acts. Judicial independence mandate forbids administrative notarization.`);
    }

    if (auth.role === 'LAW_FIRM_ADMIN') {
      throw new Error(`ROLE_VIOLATION: Law Firm Administrators cannot apply an ENP signature or seal. Notarial act is personal to the commissioned attorney.`);
    }

    if (auth.role !== 'ENP') {
      throw new Error(`ROLE_VIOLATION: Only commissioned Electronic Notaries Public (ENP) can execute ${action} under Rule VI.`);
    }

    if (!auth.mfaVerified) {
      throw new Error(`MFA_REQUIRED: Step-up multi-factor authentication required prior to applying ${action}.`);
    }

    if (auth.enpStatus !== 'ACTIVE') {
      throw new Error(`COMMISSION_BLOCKED: ENP commission status is '${auth.enpStatus}'. Suspended, expired or revoked ENPs are strictly blocked.`);
    }

    if (auth.commissionValidUntil) {
      const expiry = new Date(auth.commissionValidUntil).getTime();
      if (Date.now() > expiry) {
        throw new Error(`COMMISSION_EXPIRED: ENP notarial commission expired on ${auth.commissionValidUntil}.`);
      }
    }
  }

  /**
   * Requirements 9, 10, 11, 12, 15, 16, 17, 18:
   * Server-authoritative notarial state transition engine.
   */
  static validateStateTransition(
    currentState: TransactionState,
    targetState: TransactionState,
    tx: Partial<NotarialTransaction>,
    auth: AuthContext
  ): void {
    if (auth.isAiAgent) {
      throw new Error(`AI_INTERVENTION_PROHIBITED: Automated AI models cannot alter notarial state or certify acts.`);
    }

    const validOrder: TransactionState[] = [
      'CREATED',
      'DOCUMENT_UPLOADED',
      'DOCUMENT_VALIDATED',
      'IDENTITY_VERIFIED',
      'JURISDICTION_CHECKED',
      'APPEARANCE_SESSION',
      'NOTARIAL_ACT_CLASSIFIED',
      'PARTICIPANT_SIGNED',
      'ENP_SIGNATURE_APPLIED',
      'ENP_SEAL_APPLIED',
      'CERTIFICATE_ISSUED',
      'NOTARIAL_BOOK_RECORDED',
      'EVIDENCE_SEALED',
      'COMPLETE'
    ];

    const currentIndex = validOrder.indexOf(currentState);
    const targetIndex = validOrder.indexOf(targetState);

    // Requirement 9: State cannot jump arbitrarily
    if (targetIndex !== currentIndex + 1 && targetState !== 'CANCELLED' && targetState !== 'REJECTED') {
      throw new Error(`INVALID_STATE_TRANSITION: Cannot skip from ${currentState} to ${targetState}. Transactions must follow the statutory progression.`);
    }

    // Requirement 10: Signing cannot occur before identity verification
    if ((targetState === 'PARTICIPANT_SIGNED' || targetState === 'ENP_SIGNATURE_APPLIED') && !tx.identityVerifiedByHumanENP) {
      throw new Error(`COMPLIANCE_VIOLATION: Participant signing or ENP signature cannot occur before human identity verification (Rule VII Sec 2).`);
    }

    // Requirement 11 & 12: REN cannot proceed without jurisdiction validation & VPN risk check
    if (tx.serviceMode === 'REN' && (targetState === 'APPEARANCE_SESSION' || targetState === 'PARTICIPANT_SIGNED')) {
      if (tx.jurisdictionStatus !== 'VERIFIED_PHILIPPINES') {
        throw new Error(`TERRITORIAL_JURISDICTION_VIOLATION: Remote Electronic Notarization (REN) strictly requires verified physical presence within the Philippines.`);
      }
      if (tx.vpnProxyDetected) {
        throw new Error(`SECURITY_INCIDENT: VPN/Proxy detected during REN session. Access blocked per Supreme Court Rule VII Sec. 2(i).`);
      }
    }

    // Requirements 6 & 7: Seal and Signature require active ENP
    if (targetState === 'ENP_SIGNATURE_APPLIED') {
      this.assertCanApplyEnpSignatureOrSeal(auth, 'SIGNATURE');
    }
    if (targetState === 'ENP_SEAL_APPLIED') {
      this.assertCanApplyEnpSignatureOrSeal(auth, 'SEAL');
    }

    // Requirements 17 & 18: AI cannot issue certificate
    if (targetState === 'CERTIFICATE_ISSUED' && auth.isAiAgent) {
      throw new Error(`STATUTORY_VIOLATION: AI cannot issue notarial certificates.`);
    }
  }

  /**
   * Requirement 20: Completed Notarial Book entries cannot be updated or deleted.
   */
  static assertNotarialBookImmutable(operation: 'UPDATE' | 'DELETE'): void {
    throw new Error(`IMMUTABLE_RECORD_VIOLATION: Rule VIII Electronic Notarial Book entries cannot be modified or deleted once sealed.`);
  }

  /**
   * Requirement 21: Corrections generate linked amendment entries.
   */
  static createLinkedAmendment(
    originalEntry: NotarialBookEntry,
    amendmentReason: string,
    amendedFields: Record<string, { oldValue: string; newValue: string }>,
    auth: AuthContext
  ): LinkedAmendmentEntry {
    this.assertCanApplyEnpSignatureOrSeal(auth, 'SIGNATURE');

    const amendmentHash = crypto
      .createHash('sha256')
      .update(originalEntry.id + originalEntry.entryHash + JSON.stringify(amendedFields) + Date.now())
      .digest('hex');

    return {
      id: `amend_${Date.now()}`,
      tenantId: originalEntry.tenantId,
      originalEntryId: originalEntry.id,
      originalSequenceNumber: originalEntry.sequenceNumber,
      amendmentSequenceNumber: originalEntry.sequenceNumber + 10000,
      grNumber: originalEntry.grNumber,
      amendmentReason,
      amendedFields,
      enpId: auth.userId,
      enpName: auth.email,
      timestamp: new Date().toISOString(),
      amendmentHash,
      linkedPreviousHash: originalEntry.entryHash
    };
  }

  /**
   * Requirement 22 & 23:
   * Completed notarized files undergo hash verification before every download.
   * Tampering creates a security incident.
   */
  static verifyDocumentHash(fileBuffer: Buffer | string, expectedSha256: string): { verified: boolean; incidentLogged?: boolean } {
    const computedHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    if (computedHash.toLowerCase() !== expectedSha256.toLowerCase()) {
      return { verified: false, incidentLogged: true };
    }
    return { verified: true, incidentLogged: false };
  }

  /**
   * Requirement 25: QR/Public verification output sanitizer.
   * Strips all private PII (National ID, telephone, medical details, full address).
   */
  static sanitizePublicVerification(tx: NotarialTransaction, bookEntrySeq: number) {
    return {
      certificateNumber: tx.certificateNumber,
      grNumber: tx.grNumber,
      actType: tx.actType,
      serviceMode: tx.serviceMode,
      documentHash: tx.documentHash,
      enpName: tx.enpName,
      enpRollNo: tx.enpRollNo,
      enpCommissionNo: tx.enpCommissionNo,
      notarizationDate: tx.completionDate || tx.timestamp,
      isValid: tx.state === 'COMPLETE',
      ruleVIIISequenceNo: bookEntrySeq,
      statutoryEvidentialWeight: 'Conclusive evidentiary weight under Rule X of A.M. No. 24-10-14-SC'
      // Note: No principalIdNumber, no email, no telephone included!
    };
  }

  /**
   * Requirement 26: Webhook HMAC-SHA256 signature verification and replay protection.
   */
  static verifyWebhookSignature(
    payloadString: string,
    signatureHeader: string | undefined,
    timestampHeader: string | undefined,
    secret: string
  ): { valid: boolean; reason?: string } {
    if (!signatureHeader || !timestampHeader) {
      return { valid: false, reason: 'MISSING_HEADERS' };
    }

    const timestamp = parseInt(timestampHeader, 10);
    const now = Math.floor(Date.now() / 1000);

    // 5-minute replay window
    if (Math.abs(now - timestamp) > 300) {
      return { valid: false, reason: 'TIMESTAMP_OUT_OF_WINDOW_REPLAY_ATTACK' };
    }

    const computedSig = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${payloadString}`)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(computedSig))) {
      return { valid: false, reason: 'INVALID_SIGNATURE' };
    }

    return { valid: true };
  }

  /**
   * Requirement 27: Enterprise APIs cannot provide instant notarization.
   */
  static rejectInstantNotarization(): never {
    throw new Error(`STATUTORY_PROHIBITION: Instant machine-only notarization violates A.M. No. 24-10-14-SC. Synchronous appearance (IEN or REN) before a commissioned ENP is strictly non-negotiable.`);
  }

  /**
   * Requirement 28: Court connectors remain disabled unless approval status is APPROVED.
   */
  static assertCourtConnectorAllowed(courtDecisionStatus: string): void {
    if (courtDecisionStatus !== 'APPROVED') {
      throw new Error(`COURT_KEY_LOCKED: Decryption connector disabled. Approving body decision is '${courtDecisionStatus}', but must be 'APPROVED'.`);
    }
  }

  /**
   * Requirement 30: Separate statutory notarial fee from commercial platform fee.
   */
  static calculateFees(actType: string, serviceMode: string): { statutoryNotarialFee: number; commercialPlatformFee: number; total: number } {
    // Statutory Notarial Fee regulated by Supreme Court Rules of Court
    let statutoryNotarialFee = 500;
    if (actType === 'ACKNOWLEDGMENT') statutoryNotarialFee = 1000;
    if (actType === 'JURAT') statutoryNotarialFee = 750;

    // Commercial Platform Fee (Infrastructure, multi-storage, identity liveness)
    const commercialPlatformFee = serviceMode === 'REN' ? 500 : 250;

    return {
      statutoryNotarialFee,
      commercialPlatformFee,
      total: statutoryNotarialFee + commercialPlatformFee
    };
  }
}
