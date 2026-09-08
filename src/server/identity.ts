/**
 * Identity Trust Engine, Provider Adapters & Jurisdiction Assurance
 * Compliant with Supreme Court A.M. No. 24-10-14-SC, HIPAA, GDPR & RA 10173 (Data Privacy Act)
 */

import crypto from 'crypto';
import {
  ConsentRecord,
  GovernmentIdentityVerification,
  IdentityVerification,
  LivenessCheck,
  LivenessStatus,
  ParticipantIdentityStatus,
  IdentityProviderConfig,
  JurisdictionAssuranceStatus,
  JurisdictionRiskFlag,
  ProviderHealthStatus
} from '../types/enf';

// =============================================================
// 1. Government Identity Provider Interface (Mandate 4)
// =============================================================

export interface GovernmentVerificationRequest {
  participantId: string;
  transactionId: string;
  provider: 'PhilSys' | 'eGovPH' | 'eVerify' | 'DFA_Passport' | 'LTO_License';
  idType: string;
  idNumber: string;
  fullName: string;
  birthDate: string;
  consentId: string;
  ipAddress: string;
  deviceId: string;
}

export interface GovernmentVerificationResponse {
  verificationReference: string;
  verificationStatus: ParticipantIdentityStatus;
  verifiedAt: string;
  responseHash: string;
  nameMatchStatus: 'EXACT_MATCH' | 'PARTIAL_MATCH' | 'MISMATCH';
  identityReference: string; // Opaque reference, never raw national ID
  evidenceReference: string;
  isProductionCertified: boolean;
  environment: 'SANDBOX' | 'MOCK' | 'PRODUCTION';
  statusDescription: string;
}

export interface GovernmentIdentityProvider {
  providerName: string;
  environment: 'SANDBOX' | 'MOCK' | 'PRODUCTION';
  requestConsent(participantId: string, transactionId: string, purpose: string): Promise<string>;
  startVerification(req: GovernmentVerificationRequest): Promise<{ sessionToken: string; redirectOrPollUrl?: string }>;
  verifyIdentity(req: GovernmentVerificationRequest): Promise<GovernmentVerificationResponse>;
  getVerificationStatus(verificationRef: string): Promise<GovernmentVerificationResponse>;
  validateProviderResponse(responsePayload: any, signature: string): boolean;
  handleCallback(payload: any): Promise<GovernmentVerificationResponse>;
  healthCheck(): Promise<{ status: ProviderHealthStatus; latencyMs: number; details: string }>;
}

// In-memory persistent consent store (Mandate 5)
export const globalConsentRecords: Map<string, ConsentRecord> = new Map();

export class ConsentManager {
  static recordConsent(
    userId: string,
    participantId: string,
    transactionId: string,
    purpose: string,
    provider: string,
    ipAddress: string,
    deviceId: string
  ): ConsentRecord {
    const id = `cst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const consent: ConsentRecord = {
      id,
      userId,
      participantId,
      transactionId,
      purpose,
      provider,
      privacyNoticeVersion: 'A.M. No. 24-10-14-SC-PN-v2.1',
      consentTextVersion: 'PH-DPA-RA10173-CONSENT-2025',
      acceptedAt: new Date().toISOString(),
      ipAddress,
      deviceId,
      status: 'ACTIVE'
    };
    globalConsentRecords.set(id, consent);
    return consent;
  }

  static validateConsent(consentId: string, transactionId: string): boolean {
    const consent = globalConsentRecords.get(consentId);
    if (!consent) return false;
    if (consent.status !== 'ACTIVE') return false;
    if (consent.transactionId !== transactionId) return false;
    if (consent.withdrawnAt) return false;
    return true;
  }

  static withdrawConsent(consentId: string): void {
    const consent = globalConsentRecords.get(consentId);
    if (consent) {
      consent.status = 'WITHDRAWN';
      consent.withdrawnAt = new Date().toISOString();
      globalConsentRecords.set(consentId, consent);
    }
  }
}

/**
 * Concrete EGovEVerifyProvider (Mandate 4)
 * Explicitly operates in SANDBOX mode to avoid simulating fake production
 */
export class EGovEVerifyProvider implements GovernmentIdentityProvider {
  providerName = 'eGovPH / PhilSys eVerify Official Gateway';
  environment: 'SANDBOX' | 'MOCK' | 'PRODUCTION' = 'SANDBOX';

  config: IdentityProviderConfig = {
    providerName: 'eGovPH / eVerify',
    environment: 'SANDBOX',
    approvalStatus: 'PENDING_APPROVAL',
    approvalReference: 'DICT-EGOV-PILOT-SANDBOX-2025-084',
    clientIdRef: 'SEC_VAULT_EGOV_CLIENT_ID',
    allowedScopes: ['identity.verify.basic', 'philsys.liveness.token'],
    allowedPurposes: ['ELECTRONIC_NOTARIAL_AUTHENTICATION_AM24_10_14_SC'],
    endpointConfig: {
      baseUrl: 'https://sandbox.everify.gov.ph/api/v1',
      timeoutMs: 5000,
      healthEndpoint: '/health'
    },
    healthStatus: 'SANDBOX'
  };

  async requestConsent(participantId: string, transactionId: string, purpose: string): Promise<string> {
    const record = ConsentManager.recordConsent(
      participantId,
      participantId,
      transactionId,
      purpose,
      this.providerName,
      '127.0.0.1',
      'device_sec_01'
    );
    return record.id;
  }

  async startVerification(req: GovernmentVerificationRequest): Promise<{ sessionToken: string; redirectOrPollUrl?: string }> {
    // Mandate 5: A government identity request MUST not be sent if required consent is missing
    if (!ConsentManager.validateConsent(req.consentId, req.transactionId)) {
      throw new Error(`CONSENT_REQUIRED: Valid participant consent under RA 10173 is required before initiating eGov verification.`);
    }

    const sessionToken = `EGOV_SESS_${crypto.createHash('sha256').update(req.participantId + Date.now()).digest('hex').slice(0, 24)}`;
    return {
      sessionToken,
      redirectOrPollUrl: `https://sandbox.everify.gov.ph/verify?session=${sessionToken}`
    };
  }

  async verifyIdentity(req: GovernmentVerificationRequest): Promise<GovernmentVerificationResponse> {
    if (!ConsentManager.validateConsent(req.consentId, req.transactionId)) {
      throw new Error(`CONSENT_REQUIRED: Valid participant consent under RA 10173 is required before initiating eGov verification.`);
    }

    // Hash response data without storing raw credentials (Mandate 6)
    const rawMockPayload = JSON.stringify({
      idType: req.idType,
      nameMatches: true,
      timestamp: Date.now()
    });
    const responseHash = crypto.createHash('sha256').update(rawMockPayload).digest('hex');
    const verificationReference = `EGOV-SANDBOX-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const tokenizedIdRef = `TOKEN_PSA_${crypto.createHash('sha256').update(req.idNumber + 'SALT_SC_PH').digest('hex').slice(0, 16)}`;

    return {
      verificationReference,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      responseHash,
      nameMatchStatus: 'EXACT_MATCH',
      identityReference: tokenizedIdRef,
      evidenceReference: `VAULT_REF_EGOV_${verificationReference}`,
      isProductionCertified: false, // Mandate 14: Never masquerade sandbox as production
      environment: this.environment,
      statusDescription: 'Sandbox Identity Attestation - Pending Official Supreme Court Production Cert'
    };
  }

  async getVerificationStatus(verificationRef: string): Promise<GovernmentVerificationResponse> {
    return {
      verificationReference: verificationRef,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      responseHash: crypto.createHash('sha256').update(verificationRef).digest('hex'),
      nameMatchStatus: 'EXACT_MATCH',
      identityReference: `TOKEN_PSA_REF_${verificationRef.slice(0, 8)}`,
      evidenceReference: `VAULT_REF_${verificationRef}`,
      isProductionCertified: false,
      environment: this.environment,
      statusDescription: 'Verified via eGov Sandbox Service'
    };
  }

  validateProviderResponse(responsePayload: any, signature: string): boolean {
    return !!(responsePayload && signature && signature.length >= 16);
  }

  async handleCallback(payload: any): Promise<GovernmentVerificationResponse> {
    return this.getVerificationStatus(payload.verificationReference || 'EGOV-CALLBACK-REF');
  }

  async healthCheck(): Promise<{ status: ProviderHealthStatus; latencyMs: number; details: string }> {
    return {
      status: 'SANDBOX',
      latencyMs: 42,
      details: 'Sandbox mock gateway reachable; production credentials await official clearance.'
    };
  }
}

// =============================================================
// 2. Liveness Engine (Mandate 7)
// =============================================================

export interface LivenessProvider {
  providerName: string;
  startCheck(participantId: string, transactionId: string, deviceId: string): Promise<{ checkId: string; challenge: string }>;
  getResult(checkId: string): Promise<LivenessCheck>;
  validateResponse(checkId: string, videoTelemetry: string): boolean;
  healthCheck(): Promise<{ status: ProviderHealthStatus; latencyMs: number }>;
}

export class MockLivenessProvider implements LivenessProvider {
  providerName = 'PhilSys ISO-30107 Anti-Spoofing Liveness Engine';

  private activeChecks: Map<string, LivenessCheck> = new Map();

  async startCheck(participantId: string, transactionId: string, deviceId: string): Promise<{ checkId: string; challenge: string }> {
    const checkId = `live_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const liveness: LivenessCheck = {
      id: checkId,
      tenantId: 'tenant_sc_ph',
      participantId,
      transactionId,
      deviceId,
      verificationSessionId: `VESS_${Date.now()}`,
      status: 'PENDING',
      livenessConfidence: 99.4,
      faceMatchScore: 98.7,
      antiSpoofingPass: true,
      approvedByHumanEnp: false, // Mandate 15: AI CANNOT approve
      completedAt: new Date().toISOString()
    };
    this.activeChecks.set(checkId, liveness);
    return { checkId, challenge: 'BLINK_AND_TURN_HEAD_LEFT' };
  }

  async getResult(checkId: string): Promise<LivenessCheck> {
    const item = this.activeChecks.get(checkId);
    if (!item) {
      throw new Error(`Liveness check ${checkId} not found.`);
    }
    return item;
  }

  validateResponse(checkId: string, videoTelemetry: string): boolean {
    return videoTelemetry.length > 0;
  }

  async healthCheck(): Promise<{ status: ProviderHealthStatus; latencyMs: number }> {
    return { status: 'SANDBOX', latencyMs: 28 };
  }

  /**
   * Affirmative human ENP approval requirement (Mandate 15)
   */
  approveCheckByHumanEnp(checkId: string, enpId: string): LivenessCheck {
    const item = this.activeChecks.get(checkId);
    if (!item) throw new Error(`Check ${checkId} not found.`);
    item.status = 'PASS';
    item.approvedByHumanEnp = true;
    this.activeChecks.set(checkId, item);
    return item;
  }
}

// =============================================================
// 3. Digital Trust Provider Interface (Mandate 19)
// =============================================================

export interface DigitalTrustProvider {
  providerName: string;
  validateCertificate(certSerial: string): Promise<{ isValid: boolean; issuer: string; expiresAt: string }>;
  signDigest(digestSha256: string, enpRollNo: string, privateKeyRef: string): Promise<{ signatureHex: string; isDevelopmentTest: boolean }>;
  verifySignature(digestSha256: string, signatureHex: string, certificateRef: string): Promise<boolean>;
  checkRevocation(certSerial: string): Promise<{ isRevoked: boolean; reason?: string }>;
  timestamp(hash: string): Promise<{ timestampToken: string; timestampIso: string }>;
  healthCheck(): Promise<{ status: ProviderHealthStatus; latencyMs: number }>;
}

export class MockTrustProvider implements DigitalTrustProvider {
  providerName = 'Philippine National PKI (PNPKI) Simulated Trust Provider';

  async validateCertificate(certSerial: string): Promise<{ isValid: boolean; issuer: string; expiresAt: string }> {
    return {
      isValid: true,
      issuer: 'DICT / Philippine National Public Key Infrastructure Root CA',
      expiresAt: '2026-12-31T23:59:59Z'
    };
  }

  async signDigest(digestSha256: string, enpRollNo: string, privateKeyRef: string): Promise<{ signatureHex: string; isDevelopmentTest: boolean }> {
    const rawSig = crypto.createHash('sha256').update(`DEV_SIG_${digestSha256}_${enpRollNo}_${privateKeyRef}`).digest('hex');
    return {
      // Mandate 19: Marked distinctly as DEVELOPMENT_TEST_SIGNATURE
      signatureHex: `DEVELOPMENT_TEST_SIGNATURE_${rawSig}`,
      isDevelopmentTest: true
    };
  }

  async verifySignature(digestSha256: string, signatureHex: string, certificateRef: string): Promise<boolean> {
    return signatureHex.startsWith('DEVELOPMENT_TEST_SIGNATURE_');
  }

  async checkRevocation(certSerial: string): Promise<{ isRevoked: boolean; reason?: string }> {
    return { isRevoked: false };
  }

  async timestamp(hash: string): Promise<{ timestampToken: string; timestampIso: string }> {
    const now = new Date().toISOString();
    return {
      timestampToken: `TSA_TOKEN_${crypto.createHash('sha256').update(hash + now).digest('hex').slice(0, 20)}`,
      timestampIso: now
    };
  }

  async healthCheck(): Promise<{ status: ProviderHealthStatus; latencyMs: number }> {
    return { status: 'SANDBOX', latencyMs: 35 };
  }
}

// =============================================================
// 4. Jurisdiction Assurance Engine (Mandates 16 & 17)
// =============================================================

export interface JurisdictionSignals {
  latitude?: number;
  longitude?: number;
  country?: string;
  ipCountry?: string;
  ipAddress: string;
  vpnDetected?: boolean;
  proxyDetected?: boolean;
  timezone?: string;
}

export class JurisdictionAssuranceEngine {
  /**
   * Assesses territorial presence under A.M. No. 24-10-14-SC Rule VII Sec 2(i).
   * Does NOT claim exact mathematical proof, returns VERIFIED, REVIEW_REQUIRED, or BLOCKED.
   */
  static assessJurisdiction(signals: JurisdictionSignals): {
    status: JurisdictionAssuranceStatus;
    riskFlags: JurisdictionRiskFlag[];
    evidenceSummary: string;
  } {
    const flags: JurisdictionRiskFlag[] = [];

    if (signals.vpnDetected) {
      flags.push('VPN_DETECTED');
    }
    if (signals.proxyDetected) {
      flags.push('PROXY_DETECTED');
    }

    if (signals.country && signals.country.toUpperCase() !== 'PH' && signals.country.toUpperCase() !== 'PHILIPPINES') {
      flags.push('OUTSIDE_ALLOWED_JURISDICTION');
    }
    if (signals.ipCountry && signals.ipCountry.toUpperCase() !== 'PH' && signals.ipCountry.toUpperCase() !== 'PHILIPPINES') {
      flags.push('OUTSIDE_ALLOWED_JURISDICTION');
    }

    if (signals.country && signals.ipCountry && signals.country.toUpperCase() !== signals.ipCountry.toUpperCase()) {
      flags.push('LOCATION_MISMATCH');
    }

    if (!signals.latitude || !signals.longitude) {
      flags.push('GEOLOCATION_UNAVAILABLE');
    }

    // REN Jurisdiction Blocking Rules:
    // If VPN or Proxy or Outside allowed jurisdiction -> BLOCKED
    if (flags.includes('VPN_DETECTED') || flags.includes('PROXY_DETECTED') || flags.includes('OUTSIDE_ALLOWED_JURISDICTION')) {
      return {
        status: 'BLOCKED',
        riskFlags: flags,
        evidenceSummary: `Territorial assurance blocked. Risk flags: ${flags.join(', ')}`
      };
    }

    // If geolocation unavailable or location mismatch -> REVIEW_REQUIRED
    if (flags.includes('LOCATION_MISMATCH') || flags.includes('GEOLOCATION_UNAVAILABLE') || flags.length > 0) {
      return {
        status: 'REVIEW_REQUIRED',
        riskFlags: flags,
        evidenceSummary: `Manual review required by Commissioned ENP prior to signing. Flags: ${flags.join(', ')}`
      };
    }

    return {
      status: 'VERIFIED',
      riskFlags: [],
      evidenceSummary: 'Territorial jurisdiction confirmed within the Republic of the Philippines (No proxy/VPN detected).'
    };
  }
}
