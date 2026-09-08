/**
 * Type definitions for Supreme Court Electronic Notarization & Legal Services Platform
 * Compliant with Supreme Court A.M. No. 24-10-14-SC, HIPAA & GDPR
 */

export type UserRole = 
  | 'CLIENT' 
  | 'LAWYER' 
  | 'ENP' // Electronic Notary Public
  | 'ADMIN' 
  | 'COMPLIANCE_OFFICER' 
  | 'AUDITOR'
  | 'ENTERPRISE_ADMIN'
  | 'PLATFORM_ADMIN'
  | 'LAW_FIRM_ADMIN';

export type EnpStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REVOKED';

export type GeographicRegion = 
  | 'National Capital Region (NCR)'
  | 'Region I - Ilocos Region'
  | 'Region II - Cagayan Valley'
  | 'Region III - Central Luzon'
  | 'Region IV-A - CALABARZON'
  | 'Region V - Bicol Region'
  | 'Region VI - Western Visayas'
  | 'Region VII - Central Visayas'
  | 'Region VIII - Eastern Visayas'
  | 'Region IX - Zamboanga Peninsula'
  | 'Region X - Northern Mindanao'
  | 'Region XI - Davao Region'
  | 'Region XII - SOCCSKSARGEN'
  | 'Region XIII - Caraga'
  | 'BARMM';

export type NotarialActType = 
  | 'ACKNOWLEDGMENT' 
  | 'JURAT' 
  | 'OATH_OR_AFFIRMATION' 
  | 'SIGNATURE_WITNESSING';

export type ServiceMode = 'IEN' | 'REN'; // In-Person vs Remote Electronic Notarization

export type TransactionState = 
  | 'CREATED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VALIDATED'
  | 'IDENTITY_VERIFIED'
  | 'JURISDICTION_CHECKED'
  | 'APPEARANCE_SESSION'
  | 'NOTARIAL_ACT_CLASSIFIED'
  | 'PARTICIPANT_SIGNED'
  | 'ENP_SIGNATURE_APPLIED'
  | 'ENP_SEAL_APPLIED'
  | 'CERTIFICATE_ISSUED'
  | 'NOTARIAL_BOOK_RECORDED'
  | 'EVIDENCE_SEALED'
  | 'COMPLETE'
  | 'CANCELLED'
  | 'REJECTED';

export interface UserProfile {
  id: string;
  tenantId: string; // Tenant isolation
  email: string;
  fullName: string;
  role: UserRole;
  enpStatus?: EnpStatus;
  mfaEnabled: boolean;
  mfaMethod: 'TOTP' | 'SMS_OTP' | 'BIOMETRIC_PASSKEY';
  commissionNumber?: string;
  ibpRollNumber?: string;
  commissionValidUntil?: string;
  phoneNumber?: string;
  region: GeographicRegion;
  avatarUrl?: string;
}

export interface LegalCase {
  id: string;
  tenantId: string;
  clientId: string;
  grNumber: string; // General Register Number e.g. G.R. No. 241014-SC
  title: string;
  courtDivision: 'En Banc' | 'First Division' | 'Second Division' | 'Third Division';
  ponente: string;
  status: 'PENDING_PETITION' | 'HEARING_SCHEDULED' | 'UNDER_DELIBERATION' | 'DECIDED' | 'ENTRY_OF_JUDGMENT' | 'ARCHIVED';
  region: GeographicRegion;
  priority: 'ROUTINE' | 'URGENT' | 'VERY_URGENT_TRO';
  clientName: string;
  clientEmail: string;
  attorneyName: string;
  attorneyRollNo: string;
  filingDate: string;
  nextHearingDate?: string;
  documentCount: number;
  blockchainTxHash: string;
  isSealed: boolean;
  decryptionKeyApproved: boolean;
  summary: string;
  hipaaGdprCompliant: boolean;
  documents: EncryptedDocument[];
}

export interface EncryptedDocument {
  id: string;
  tenantId: string;
  clientId: string;
  caseId: string;
  title: string;
  fileType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  sha256Hash: string;
  encryptionAlgorithm: 'AES-256-GCM';
  keyFingerprint: string;
  storageLocations: string[]; // multi-storage e.g. ['Cloud Storage Ph-East', 'Judicial Vault Alpha', 'Immutable DR Node']
  isCourtLocked: boolean;
  downloadUrl?: string;
}

export interface NotarialTransaction {
  id: string;
  tenantId: string;
  clientId: string;
  grNumber: string;
  actType: NotarialActType;
  serviceMode: ServiceMode;
  state: TransactionState;
  principalName: string;
  principalEmail: string;
  principalIdType: 'Philippine National ID (PhilSys)' | 'Passport' | 'Driver\'s License' | 'IBP ID' | 'UMID';
  principalIdNumber: string; // Private, PII masked in public outputs
  enpId: string;
  enpName: string;
  enpCommissionNo: string;
  enpRollNo: string;
  enpStatus: EnpStatus;
  documentTitle: string;
  documentHash: string;
  certificateNumber: string;
  jurisdictionStatus: 'VERIFIED_PHILIPPINES' | 'REVIEW_REQUIRED' | 'BLOCKED_VPN_DETECTED' | 'EXTRATERRITORIAL_CONSULAR';
  vpnProxyDetected: boolean;
  identityTrustScore: number; // 0 - 100
  identityVerifiedByHumanENP: boolean; // Mandate 15: AI CANNOT approve identity
  jurisdictionVerifiedByRule: boolean; // Mandate 16: AI CANNOT override jurisdiction
  isEncryptedAes256: boolean;
  videoSessionRecorded?: boolean;
  statutoryNotarialFee: number; // Separate statutory fee under Supreme Court Rules
  commercialPlatformFee: number; // Separate platform SaaS fee
  fee: number; // Total fee
  timestamp: string;
  completionDate?: string;
}

export interface NotarialBookEntry {
  id: string;
  tenantId: string;
  sequenceNumber: number;
  enpId: string;
  enpName: string;
  transactionId: string;
  grNumber: string;
  actType: NotarialActType;
  documentTitle: string;
  principalName: string;
  competentEvidenceId: string;
  statutoryFee: number;
  commercialFee: number;
  feeCharged: number;
  serviceMode: ServiceMode;
  entryHash: string;
  previousEntryHash: string; // Blockchain-like cryptographic hash chain
  timestamp: string;
  isVerified: boolean;
  isAmended?: boolean;
  amendmentRefId?: string;
}

export interface LinkedAmendmentEntry {
  id: string;
  tenantId: string;
  originalEntryId: string;
  originalSequenceNumber: number;
  amendmentSequenceNumber: number;
  grNumber: string;
  amendmentReason: string;
  amendedFields: Record<string, { oldValue: string; newValue: string }>;
  enpId: string;
  enpName: string;
  timestamp: string;
  amendmentHash: string;
  linkedPreviousHash: string;
}

export interface EvidenceVaultItem {
  id: string;
  tenantId: string;
  transactionId: string;
  grNumber: string;
  mediaType: 'AUDIO_VIDEO_REN' | 'GOVERNMENT_ID_IMAGE' | 'BIOMETRIC_LIVENESS_RECORD' | 'GEOLOCATION_TELEMETRY';
  sha256Checksum: string;
  storageNode: 'Manila Primary Vault' | 'Cebu Disaster Replica' | 'Davao Immutable Node';
  uploadedAt: string;
  retentionExpiry: string; // 10 years per Rule VII
  isImmutable: boolean;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  resource: string;
  grNumber?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUSPICIOUS';
  ipAddress: string;
  location: string;
  userAgent: string;
  status: 'SUCCESS' | 'BLOCKED' | 'FLAGGED';
  logHash: string;
  previousLogHash?: string;
}

export interface CourtKeyDecision {
  id: string;
  tenantId: string;
  grNumber: string;
  caseTitle: string;
  resolutionNumber: string;
  approvingBody: 'Supreme Court En Banc' | 'Supreme Court First Division' | 'Supreme Court Second Division' | 'Executive Judge Resolution';
  ponenteJustice: string;
  decisionDate: string;
  status: 'PENDING_PETITION' | 'APPROVED' | 'DENIED' | 'REVOKED';
  keyFingerprint: string;
  authorizedParty: string;
  justification: string;
  validityExpiry: string;
}

export interface SecureMessage {
  id: string;
  tenantId: string;
  senderId?: string;
  recipientId?: string;
  grNumber: string;
  caseTitle: string;
  senderName: string;
  senderRole: UserRole;
  recipientName: string;
  recipientRole: UserRole;
  encryptedContent: string;
  sentAt: string;
  isRead: boolean;
}

export interface NotificationItem {
  id: string;
  tenantId: string;
  recipientEmail: string;
  recipientPhone: string;
  type: 'COURT_REMINDER' | 'STATUS_UPDATE' | 'SECURITY_ALERT' | 'KEY_ISSUANCE';
  channel: 'EMAIL' | 'SMS' | 'DUAL';
  subject: string;
  message: string;
  grNumber?: string;
  status: 'SENT' | 'PENDING' | 'FAILED';
  sentAt: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
}

/**
 * Public Verification output (Mandate 25): Stripped of private client PII
 */
export interface SanitizedPublicVerification {
  certificateNumber: string;
  grNumber: string;
  actType: NotarialActType;
  serviceMode: ServiceMode;
  documentHash: string;
  enpName: string;
  enpRollNo: string;
  enpCommissionNo: string;
  notarizationDate: string;
  isValid: boolean;
  ruleVIIISequenceNo: number;
  statutoryEvidentialWeight: string;
  // Intentionally excludes: Client national ID number, telephone, home address, case details
}

export * from './enf';

