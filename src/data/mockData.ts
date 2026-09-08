import { LegalCase, NotarialBookEntry, AuditLog, CourtKeyDecision, SecureMessage, NotificationItem, UserProfile } from '../types';
import { syncHash } from '../utils/crypto';

export const initialUsers: UserProfile[] = [
  {
    id: 'usr_attorney_santos',
    tenantId: 'tenant_sc_ph',
    email: 'atty.santos@supremecourt-law.ph',
    fullName: 'Atty. Maria Clara Santos',
    role: 'LAWYER',
    mfaEnabled: true,
    mfaMethod: 'TOTP',
    ibpRollNumber: '78492',
    commissionNumber: 'ENP-2025-0144',
    phoneNumber: '+63 917 555 0192',
    region: 'National Capital Region (NCR)'
  },
  {
    id: 'usr_enp_villanueva',
    tenantId: 'tenant_sc_ph',
    email: 'atty.villanueva@notary.ph',
    fullName: 'Atty. Roberto C. Villanueva',
    role: 'ENP',
    enpStatus: 'ACTIVE',
    mfaEnabled: true,
    mfaMethod: 'BIOMETRIC_PASSKEY',
    commissionNumber: 'ENP-NCR-2025-0089',
    ibpRollNumber: '54210',
    commissionValidUntil: '2026-12-31',
    phoneNumber: '+63 920 987 6543',
    region: 'National Capital Region (NCR)'
  },
  {
    id: 'usr_client_valdez',
    tenantId: 'tenant_sc_ph',
    email: 'antonio.valdez@ph-enterprise.com',
    fullName: 'Engr. Antonio M. Valdez',
    role: 'CLIENT',
    mfaEnabled: true,
    mfaMethod: 'SMS_OTP',
    phoneNumber: '+63 918 123 4567',
    region: 'Region IV-A - CALABARZON'
  },
  {
    id: 'usr_admin_judicial',
    tenantId: 'tenant_sc_ph',
    email: 'admin.security@supremecourt.gov.ph',
    fullName: 'Hon. Administrator Elena R. Cruz',
    role: 'ADMIN',
    mfaEnabled: true,
    mfaMethod: 'TOTP',
    phoneNumber: '+63 917 888 9900',
    region: 'National Capital Region (NCR)'
  },
  {
    id: 'usr_compliance_gdpr',
    tenantId: 'tenant_sc_ph',
    email: 'compliance.officer@judiciary.ph',
    fullName: 'Dir. Jonathan P. Mendoza',
    role: 'COMPLIANCE_OFFICER',
    mfaEnabled: true,
    mfaMethod: 'TOTP',
    phoneNumber: '+63 922 334 4556',
    region: 'National Capital Region (NCR)'
  },
  // Statutory Audit & Role-Testing Personas
  {
    id: 'usr_enp_suspended',
    tenantId: 'tenant_sc_ph',
    email: 'suspended.notary@inactive.ph',
    fullName: 'Atty. Rodolfo M. Sison (Suspended)',
    role: 'ENP',
    enpStatus: 'SUSPENDED',
    mfaEnabled: true,
    mfaMethod: 'TOTP',
    commissionNumber: 'ENP-2024-0012',
    ibpRollNumber: '33211',
    commissionValidUntil: '2025-12-31',
    phoneNumber: '+63 919 000 1122',
    region: 'Region III - Central Luzon'
  },
  {
    id: 'usr_enterprise_admin',
    tenantId: 'tenant_sc_ph',
    email: 'enterprise.admin@corp-it.ph',
    fullName: 'Marcus Vance (Enterprise IT Admin)',
    role: 'ENTERPRISE_ADMIN',
    mfaEnabled: true,
    mfaMethod: 'TOTP',
    phoneNumber: '+63 917 111 2233',
    region: 'National Capital Region (NCR)'
  },
  {
    id: 'usr_platform_admin',
    tenantId: 'tenant_sc_ph',
    email: 'platform.ops@cloud-infra.ph',
    fullName: 'David K. Tan (Platform Cloud Admin)',
    role: 'PLATFORM_ADMIN',
    mfaEnabled: true,
    mfaMethod: 'TOTP',
    phoneNumber: '+63 917 222 3344',
    region: 'National Capital Region (NCR)'
  },
  {
    id: 'usr_law_firm_admin',
    tenantId: 'tenant_sc_ph',
    email: 'firm.admin@santos-law.ph',
    fullName: 'Beatriz L. Gomez (Law Firm Ops Manager)',
    role: 'LAW_FIRM_ADMIN',
    mfaEnabled: true,
    mfaMethod: 'TOTP',
    phoneNumber: '+63 917 333 4455',
    region: 'National Capital Region (NCR)'
  }
];

export const initialLegalCases: LegalCase[] = [
  {
    id: 'case_gr_241014',
    tenantId: 'tenant_sc_ph',
    clientId: 'usr_client_valdez',
    grNumber: 'G.R. No. 241014-SC',
    title: 'Philippine Commercial Bank vs. Apex Energy Consortium & Republic of the Philippines',
    courtDivision: 'En Banc',
    ponente: 'Associate Justice Alfredo Benjamin S. Caguioa',
    status: 'UNDER_DELIBERATION',
    region: 'National Capital Region (NCR)',
    priority: 'VERY_URGENT_TRO',
    clientName: 'Apex Energy Consortium Inc.',
    clientEmail: 'antonio.valdez@ph-enterprise.com',
    attorneyName: 'Atty. Maria Clara Santos',
    attorneyRollNo: '78492',
    filingDate: '2025-01-14',
    nextHearingDate: '2025-03-28 09:30 AM',
    documentCount: 6,
    blockchainTxHash: 'SC-TX-8f23a9c41b80e451b660207865231c6a2e8820c75402a7b8e19b88f3a8b27c10',
    isSealed: true,
    decryptionKeyApproved: true,
    hipaaGdprCompliant: true,
    summary: 'Petition for Certiorari and Prohibition with prayer for issuance of Temporary Restraining Order (TRO) regarding renewable energy franchise rights and syndicated credit facility execution.',
    documents: [
      {
        id: 'doc_pet_01',
        tenantId: 'tenant_sc_ph',
        clientId: 'usr_client_valdez',
        caseId: 'case_gr_241014',
        title: 'Verified Petition for Certiorari with Urgent Prayer for TRO.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: 2450800,
        uploadedAt: '2025-01-14 10:15 AM',
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        encryptionAlgorithm: 'AES-256-GCM',
        keyFingerprint: 'KEY-SC-ENBANC-2025-9921',
        storageLocations: ['Storage Vault Manila (Primary)', 'Encrypted Disaster Replica Cebu', 'Judicial Immutable Archive'],
        isCourtLocked: false
      },
      {
        id: 'doc_pet_02',
        tenantId: 'tenant_sc_ph',
        clientId: 'usr_client_valdez',
        caseId: 'case_gr_241014',
        title: 'Annex A - Notarized Syndicated Loan Restructuring Deed.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: 4120300,
        uploadedAt: '2025-01-14 10:30 AM',
        sha256Hash: 'c9f0f895fb98ab9159f51fd0297e236d1da0572104e0e560f848f121d5a3ef2c',
        encryptionAlgorithm: 'AES-256-GCM',
        keyFingerprint: 'KEY-SC-ENBANC-2025-9921',
        storageLocations: ['Storage Vault Manila (Primary)', 'Encrypted Disaster Replica Cebu', 'Judicial Immutable Archive'],
        isCourtLocked: false
      }
    ]
  },
  {
    id: 'case_gr_239811',
    tenantId: 'tenant_sc_ph',
    clientId: 'usr_client_tan',
    grNumber: 'G.R. No. 239811-SC',
    title: 'Federation of Maritime Seafarers vs. Maritime Industry Authority (MARINA)',
    courtDivision: 'First Division',
    ponente: 'Associate Justice Ramon Paul L. Hernando',
    status: 'HEARING_SCHEDULED',
    region: 'Region VII - Central Visayas',
    priority: 'URGENT',
    clientName: 'Capt. Romualdo Tan (Federation President)',
    clientEmail: 'maritime.federation@visayas-law.ph',
    attorneyName: 'Atty. Maria Clara Santos',
    attorneyRollNo: '78492',
    filingDate: '2025-02-03',
    nextHearingDate: '2025-04-15 02:00 PM',
    documentCount: 4,
    blockchainTxHash: 'SC-TX-33bc184a51e22da094ecb214902187f5bbcd219e832fa07b4618a8cefa510b99',
    isSealed: true,
    decryptionKeyApproved: false, // Locked until Court Key Resolution is approved
    hipaaGdprCompliant: true,
    summary: 'Special Civil Action for Mandamus compelling implementation of updated overseas seafarer hazard remuneration protocols under STCW international standards.',
    documents: [
      {
        id: 'doc_marina_01',
        tenantId: 'tenant_sc_ph',
        clientId: 'usr_client_tan',
        caseId: 'case_gr_239811',
        title: 'Petition for Mandamus with Urgent Application for TRO.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: 1890000,
        uploadedAt: '2025-02-03 11:20 AM',
        sha256Hash: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
        encryptionAlgorithm: 'AES-256-GCM',
        keyFingerprint: 'KEY-SC-DIV1-2025-4412',
        storageLocations: ['Storage Vault Manila (Primary)', 'Encrypted Disaster Replica Cebu', 'Judicial Immutable Archive'],
        isCourtLocked: true // Court locked
      }
    ]
  }
];

export const initialNotarialBookEntries: NotarialBookEntry[] = [
  {
    id: 'book_entry_001',
    tenantId: 'tenant_sc_ph',
    sequenceNumber: 1,
    enpId: 'usr_enp_villanueva',
    enpName: 'Atty. Roberto C. Villanueva',
    transactionId: 'tx_ren_001',
    grNumber: 'G.R. No. 241014-SC',
    actType: 'ACKNOWLEDGMENT',
    documentTitle: 'Verified Petition for Certiorari with Urgent Prayer for TRO.pdf',
    principalName: 'Engr. Antonio M. Valdez',
    competentEvidenceId: 'PhilSys National ID: 9921-4401-2098-7712',
    statutoryFee: 1000,
    commercialFee: 500,
    feeCharged: 1500,
    serviceMode: 'REN',
    entryHash: 'f4b9c1d098e721a6b0c2e3f4a5b6c7d8e9f0123456789abcdef0123456789abc',
    previousEntryHash: '0000000000000000000000000000000000000000000000000000000000000000', // Genesis block
    timestamp: '2025-01-14 10:15 AM',
    isVerified: true
  },
  {
    id: 'book_entry_002',
    tenantId: 'tenant_sc_ph',
    sequenceNumber: 2,
    enpId: 'usr_enp_villanueva',
    enpName: 'Atty. Roberto C. Villanueva',
    transactionId: 'tx_ien_002',
    grNumber: 'G.R. No. 241014-SC',
    actType: 'JURAT',
    documentTitle: 'Annex A - Notarized Syndicated Loan Restructuring Deed.pdf',
    principalName: 'Engr. Antonio M. Valdez',
    competentEvidenceId: 'Passport: P9182341A (DFA Manila)',
    statutoryFee: 750,
    commercialFee: 250,
    feeCharged: 1000,
    serviceMode: 'IEN',
    entryHash: syncHash('f4b9c1d098e721a6b0c2e3f4a5b6c7d8e9f0123456789abcdef0123456789abc' + 'ENTRY_002'),
    previousEntryHash: 'f4b9c1d098e721a6b0c2e3f4a5b6c7d8e9f0123456789abcdef0123456789abc',
    timestamp: '2025-01-14 10:30 AM',
    isVerified: true
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log_01',
    tenantId: 'tenant_sc_ph',
    timestamp: '2025-03-08 08:30:14 AM',
    actor: 'atty.villanueva@notary.ph',
    actorRole: 'ENP',
    action: 'Affixed Statutory Electronic Notarial Seal & Digital Signature',
    resource: 'Rule VIII Notarial Book Sequence #42',
    grNumber: 'G.R. No. 241014-SC',
    severity: 'INFO',
    ipAddress: '120.29.74.19',
    location: 'Makati City, National Capital Region (NCR)',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'SUCCESS',
    logHash: syncHash('LOG_SEC_001')
  },
  {
    id: 'log_02',
    tenantId: 'tenant_sc_ph',
    timestamp: '2025-03-08 08:31:02 AM',
    actor: 'admin.security@supremecourt.gov.ph',
    actorRole: 'ADMIN',
    action: 'Decryption Key Authorized pursuant to En Banc Resolution',
    resource: 'Key Release Gateway (Supreme Court Vault)',
    grNumber: 'G.R. No. 241014-SC',
    severity: 'INFO',
    ipAddress: '210.213.82.11',
    location: 'Ermita, Manila (Supreme Court Complex)',
    userAgent: 'JudicialSecureClient/4.1 (Court Admin Console)',
    status: 'SUCCESS',
    logHash: syncHash('LOG_SEC_002')
  }
];

export const initialCourtKeyDecisions: CourtKeyDecision[] = [
  {
    id: 'dec_enbanc_01',
    tenantId: 'tenant_sc_ph',
    grNumber: 'G.R. No. 241014-SC',
    caseTitle: 'Philippine Commercial Bank vs. Apex Energy Consortium',
    resolutionNumber: 'En Banc Res. No. 2025-019-EB',
    approvingBody: 'Supreme Court En Banc',
    ponenteJustice: 'Associate Justice Alfredo Benjamin S. Caguioa',
    decisionDate: '2025-02-18',
    status: 'APPROVED',
    keyFingerprint: 'KEY-SC-ENBANC-2025-9921',
    authorizedParty: 'Lead Counsel & Litigants of Record',
    justification: 'Resolution granting urgent access to sealed credit covenants and escrow telemetry exhibits for pending oral arguments.',
    validityExpiry: '2025-12-31'
  },
  {
    id: 'dec_div1_02',
    tenantId: 'tenant_sc_ph',
    grNumber: 'G.R. No. 239811-SC',
    caseTitle: 'Federation of Maritime Seafarers vs. MARINA',
    resolutionNumber: 'First Div. Res. No. 2025-084-FD',
    approvingBody: 'Supreme Court First Division',
    ponenteJustice: 'Associate Justice Ramon Paul L. Hernando',
    decisionDate: '2025-03-01',
    status: 'PENDING_PETITION',
    keyFingerprint: 'KEY-SC-DIV1-2025-4412',
    authorizedParty: 'Special Maritime Appellate Panel',
    justification: 'Petition for release of encrypted safety audit reports pending compliance with notice to Solicitor General.',
    validityExpiry: '2025-06-30'
  }
];

export const initialSecureMessages: SecureMessage[] = [
  {
    id: 'msg_01',
    tenantId: 'tenant_sc_ph',
    grNumber: 'G.R. No. 241014-SC',
    caseTitle: 'Philippine Commercial Bank vs. Apex Energy Consortium',
    senderName: 'Atty. Maria Clara Santos',
    senderRole: 'LAWYER',
    recipientName: 'Engr. Antonio M. Valdez',
    recipientRole: 'CLIENT',
    encryptedContent: '[AES-256 ENCRYPTED] Engr. Valdez, the Supreme Court En Banc has officially calendared our oral argument for March 28. Please ensure the updated escrow financial disclosures are signed electronically before our pre-trial videoconference.',
    sentAt: '2025-03-07 04:15 PM',
    isRead: true
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_01',
    tenantId: 'tenant_sc_ph',
    recipientEmail: 'antonio.valdez@ph-enterprise.com',
    recipientPhone: '+63 918 123 4567',
    type: 'COURT_REMINDER',
    channel: 'DUAL',
    subject: 'Supreme Court Oral Argument Reminder: G.R. No. 241014-SC',
    message: 'Notice of En Banc Hearing scheduled on March 28, 2025 at 09:30 AM (Session Hall, Supreme Court Manila). Please ensure electronic credentials are active.',
    grNumber: 'G.R. No. 241014-SC',
    status: 'SENT',
    sentAt: '2025-03-08 08:00 AM',
    priority: 'URGENT'
  }
];
