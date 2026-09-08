/**
 * Supreme Court Electronic Notarization Facility (ENF) - Transaction & Compliance Types
 * Strictly aligned with A.M. No. 24-10-14-SC, HIPAA, GDPR & RA 10173
 */

export type EnfTransactionState =
  | 'CREATED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VALIDATED'
  | 'PARTICIPANTS_INVITED'
  | 'IDENTITY_VERIFICATION'
  | 'IDENTITY_REVIEW_REQUIRED'
  | 'SERVICE_MODE_SELECTED'
  | 'JURISDICTION_CHECK'
  | 'JURISDICTION_REVIEW_REQUIRED'
  | 'ENP_ASSIGNED'
  | 'APPEARANCE_SCHEDULED'
  | 'APPEARANCE_SESSION'
  | 'NOTARIAL_ACT_CLASSIFIED'
  | 'READY_FOR_SIGNING'
  | 'PARTICIPANT_SIGNING'
  | 'ENP_SIGNATURE_APPLIED'
  | 'ENP_SEAL_APPLIED'
  | 'CERTIFICATE_ISSUED'
  | 'NOTARIAL_BOOK_RECORDED'
  | 'EVIDENCE_SEALED'
  | 'PAYMENT_SETTLED'
  | 'REGULATORY_SYNC_PENDING'
  | 'REGULATORY_SYNC_COMPLETED'
  | 'COMPLETE'
  // Exception States
  | 'CANCELLED'
  | 'REJECTED'
  | 'SECURITY_HOLD'
  | 'CORRECTION_REQUESTED';

export type ParticipantIdentityStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REVIEW_REQUIRED'
  | 'FAILED'
  | 'BLOCKED'
  | 'EXPIRED';

export type LivenessStatus = 'PENDING' | 'PASS' | 'REVIEW' | 'FAIL';

export type JurisdictionAssuranceStatus = 'VERIFIED' | 'REVIEW_REQUIRED' | 'BLOCKED';

export type JurisdictionRiskFlag =
  | 'VPN_DETECTED'
  | 'PROXY_DETECTED'
  | 'LOCATION_MISMATCH'
  | 'OUTSIDE_ALLOWED_JURISDICTION'
  | 'GEOLOCATION_UNAVAILABLE'
  | 'DEVICE_LOCATION_MISMATCH';

export type EnpCredentialStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'EXPIRING'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'RESIGNED'
  | 'DECEASED';

export type ProviderEnvironment = 'SANDBOX' | 'MOCK' | 'PRODUCTION' | 'PENDING_APPROVAL';

export type ProviderHealthStatus =
  | 'OPERATIONAL'
  | 'DEGRADED'
  | 'UNAVAILABLE'
  | 'NOT_CONFIGURED'
  | 'SANDBOX'
  | 'PENDING_APPROVAL';

// -------------------------------------------------------------
// Identity Trust Engine Entities
// -------------------------------------------------------------

export interface IdentityVerification {
  id: string;
  tenantId: string;
  participantId: string;
  transactionId: string;
  status: ParticipantIdentityStatus;
  provider: string;
  verificationReference: string;
  nameMatchStatus: 'EXACT_MATCH' | 'PARTIAL_MATCH' | 'MISMATCH';
  confidenceScore: number;
  reviewedByEnpId?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IdentityVerificationEvent {
  id: string;
  verificationId: string;
  transactionId: string;
  eventType: 'CONSENT_GRANTED' | 'GOV_ID_SUBMITTED' | 'LIVENESS_COMPLETED' | 'MANUAL_OVERRIDE_ATTEMPT' | 'ENP_VERIFIED';
  status: ParticipantIdentityStatus;
  actorId: string;
  actorRole: string;
  timestamp: string;
  details: string;
}

export interface GovernmentIdentityVerification {
  id: string;
  tenantId: string;
  participantId: string;
  transactionId: string;
  provider: 'PhilSys' | 'eGovPH' | 'eVerify' | 'DFA_Passport' | 'LTO_License';
  verificationReference: string;
  verificationStatus: ParticipantIdentityStatus;
  verifiedAt: string;
  responseHash: string; // SHA-256 digest of response - no raw PII stored
  nameMatchStatus: 'EXACT_MATCH' | 'PARTIAL_MATCH' | 'MISMATCH';
  identityReference: string; // Tokenized reference
  evidenceReference: string;
  isProductionCertified: boolean;
}

export interface LivenessCheck {
  id: string;
  tenantId: string;
  participantId: string;
  transactionId: string;
  deviceId: string;
  verificationSessionId: string;
  status: LivenessStatus;
  livenessConfidence: number; // 0-100
  faceMatchScore: number; // 0-100
  antiSpoofingPass: boolean;
  approvedByHumanEnp: boolean; // Mandate 15: AI CANNOT approve
  completedAt: string;
}

export interface MfaEvent {
  id: string;
  tenantId: string;
  userId: string;
  userRole: string;
  actionType: 'ENP_SIGNATURE' | 'ENP_SEAL' | 'CREDENTIAL_CHANGE' | 'BULK_DATA_EXPORT' | 'API_KEY_ROTATION' | 'SECURITY_CONFIG_CHANGE';
  mfaMethod: 'TOTP' | 'SMS_OTP' | 'BIOMETRIC_PASSKEY';
  stepUpToken: string;
  ipAddress: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'CHALLENGE_ISSUED';
}

export interface IdentityRiskFlagRecord {
  id: string;
  transactionId: string;
  participantId: string;
  flag: JurisdictionRiskFlag;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedAt: string;
  resolved: boolean;
  resolvedByEnpId?: string;
  resolutionNotes?: string;
}

export interface IdentityProviderConfig {
  providerName: string;
  environment: ProviderEnvironment;
  approvalStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  approvalReference: string;
  clientIdRef: string; // Key reference, never raw secret
  allowedScopes: string[];
  allowedPurposes: string[];
  endpointConfig: {
    baseUrl: string;
    timeoutMs: number;
    healthEndpoint: string;
  };
  healthStatus: ProviderHealthStatus;
}

// -------------------------------------------------------------
// eGov Consent Record (Mandate 5)
// -------------------------------------------------------------

export interface ConsentRecord {
  id: string;
  userId: string;
  participantId: string;
  transactionId: string;
  purpose: string;
  provider: string;
  privacyNoticeVersion: string;
  consentTextVersion: string;
  acceptedAt: string;
  ipAddress: string;
  deviceId: string;
  withdrawnAt?: string;
  status: 'ACTIVE' | 'WITHDRAWN' | 'EXPIRED';
}

// -------------------------------------------------------------
// ENP Credential Engine Entities (Mandate 9 & 10)
// -------------------------------------------------------------

export interface EnpRecord {
  id: string;
  tenantId: string;
  userId: string;
  rollOfAttorneysNumber: string; // Unique within ENF
  ibpNumber: string;
  commissionNumber: string;
  commissionStart: string;
  commissionEnd: string;
  commissionStatus: EnpCredentialStatus;
  professionalTaxReceipt: string;
  mcleStatus: 'COMPLIANT' | 'EXEMPT' | 'NON_COMPLIANT';
  ulasStatus: 'VERIFIED' | 'PENDING' | 'SUSPENDED';
  enfAccountId: string; // Unique constraint 1:1 per ENP
  digitalCertificateRef: string;
  sealRef: string;
  status: EnpCredentialStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EnpCommission {
  id: string;
  enpId: string;
  courtTerritory: string; // e.g., "RTC Manila Branch 41"
  commissionNumber: string;
  startDate: string;
  endDate: string;
  status: EnpCredentialStatus;
  executiveJudgeSignatureRef: string;
}

export interface EnpCertificate {
  id: string;
  enpId: string;
  certificateSerialNumber: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  sha256Fingerprint: string;
  isRevoked: boolean;
}

export interface EnpSealRecord {
  id: string;
  enpId: string;
  sealSvgData: string;
  sealSha256: string;
  authorizedJurisdiction: string;
  registeredAt: string;
}

// -------------------------------------------------------------
// Document Version Control (Mandates 12 & 13)
// -------------------------------------------------------------

export interface DocumentVersion {
  documentVersionId: string;
  documentId: string;
  transactionId: string;
  versionNumber: number; // 1 to 6
  versionStage: 'Version 1 - Uploaded' | 'Version 2 - Lawyer Reviewed' | 'Version 3 - Approved' | 'Version 4 - Participant Signed' | 'Version 5 - ENP Signed' | 'Version 6 - Notarized PDF/A';
  hashAlgorithm: 'SHA-256';
  contentHash: string;
  size: number;
  mimeType: string;
  storageReference: string;
  createdAt: string;
  createdByUserId: string;
  isSignedOrSealed: boolean;
}

// -------------------------------------------------------------
// Appearance Records (IEN & REN, Mandates 14 & 15)
// -------------------------------------------------------------

export interface AppearanceRecord {
  sessionId: string;
  transactionId: string;
  mode: 'IEN' | 'REN';
  enpId: string;
  startedAt: string;
  completedAt?: string;
  appearanceConfirmed: boolean;
  participantsPresent: {
    participantId: string;
    fullName: string;
    role: string;
    present: boolean;
    identityConfirmedByEnp: boolean;
    voluntarinessConfirmed: boolean;
  }[];
  notes?: string;
  evidenceReference: string;
  // REN specific
  videoProvider?: string;
  recordingReference?: string;
  sessionContinuityMaintained?: boolean;
}

// -------------------------------------------------------------
// Notarial Certificate (Mandate 21)
// -------------------------------------------------------------

export type NotarialActType = 'ACKNOWLEDGMENT' | 'JURAT' | 'OATH_OR_AFFIRMATION' | 'SIGNATURE_WITNESSING';

export interface NotarialCertificateRecord {
  id: string;
  transactionId: string;
  enpId: string;
  certificateNumber: string;
  actType: NotarialActType;
  mode: 'IEN' | 'REN';
  documentHash: string;
  issuedAt: string;
  enpCredentialSnapshot: {
    fullName: string;
    rollOfAttorneysNumber: string;
    ibpNumber: string;
    commissionNumber: string;
    territory: string;
  };
  certificateHash: string;
  verificationId: string;
  status: 'VALID' | 'REVOKED';
}

// -------------------------------------------------------------
// Evidence Package & Items (Mandate 24)
// -------------------------------------------------------------

export interface EvidencePackage {
  id: string;
  transactionId: string;
  grNumber: string;
  sealedAt: string;
  manifestHash: string;
  isImmutable: boolean;
  items: EvidenceItem[];
}

export interface EvidenceItem {
  id: string;
  packageId: string;
  itemType:
    | 'ORIGINAL_DOCUMENT'
    | 'FINAL_DOCUMENT'
    | 'IDENTITY_RESULT'
    | 'GOVERNMENT_VERIFICATION'
    | 'LIVENESS_RECORD'
    | 'MFA_RECORD'
    | 'JURISDICTION_EVIDENCE'
    | 'SESSION_RECORD'
    | 'PARTICIPANT_SIGNATURES'
    | 'ENP_SIGNATURE'
    | 'ENP_SEAL'
    | 'CERTIFICATE'
    | 'NOTARIAL_BOOK_ENTRY'
    | 'CONSENT'
    | 'PAYMENT_RECORD'
    | 'REGULATORY_SYNCHRONIZATION';
  sha256Hash: string;
  storageRef: string;
  timestamp: string;
}

// -------------------------------------------------------------
// Transaction Participant
// -------------------------------------------------------------

export interface TransactionParticipant {
  id: string;
  transactionId: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'PRINCIPAL' | 'AFFIANT' | 'WITNESS' | 'COUNSEL';
  identityStatus: ParticipantIdentityStatus;
  consentGiven: boolean;
  signatureApplied: boolean;
  signatureTimestamp?: string;
  signatureHash?: string;
  signatureType?: 'DIGITAL_CRYPTOGRAPHIC' | 'BIOMETRIC_CAPTURED';
}

// -------------------------------------------------------------
// Central Engine Transaction Object
// -------------------------------------------------------------

export interface EnfTransaction {
  id: string;
  tenantId: string;
  clientId: string;
  grNumber: string;
  documentTitle: string;
  state: EnfTransactionState;
  serviceMode?: 'IEN' | 'REN';
  actType?: 'ACKNOWLEDGMENT' | 'JURAT' | 'OATH_OR_AFFIRMATION' | 'SIGNATURE_WITNESSING';
  actClassificationSource?: 'AI_SUGGESTED' | 'ENP_CONFIRMED';
  actClassificationConfidence?: number;
  assignedEnpId?: string;
  assignedEnpName?: string;
  participants: TransactionParticipant[];
  documentVersions: DocumentVersion[];
  currentDocumentHash: string;
  jurisdictionStatus: JurisdictionAssuranceStatus;
  jurisdictionEvidence?: {
    latitude?: number;
    longitude?: number;
    country: string;
    city?: string;
    ipAddress: string;
    vpnDetected: boolean;
    proxyDetected: boolean;
    timezone: string;
    riskFlags: JurisdictionRiskFlag[];
  };
  appearanceRecord?: AppearanceRecord;
  certificateRecord?: NotarialCertificateRecord;
  statutoryNotarialFee: number;
  commercialPlatformFee: number;
  totalFee: number;
  paymentSettled: boolean;
  regulatorySyncStatus: 'NOT_SUBMITTED' | 'PENDING' | 'COMPLETED' | 'FAILED';
  evidencePackageId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancellationReason?: string;
}
