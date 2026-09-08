/**
 * Initial Seed Data for the Central Notarial Transaction Engine
 * Sets up transactions across various states for immediate end-to-end verification
 */

import {
  enfTransactionsStore,
  registeredEnpStore,
  enfCertificatesStore,
  enfNotarialBook
} from './engine';
import { EnfTransaction, NotarialCertificateRecord } from '../types/enf';
import { NotarialBookEntry } from '../types';

export function seedInitialTransactions() {
  if (enfTransactionsStore.size > 0) return;

  const now = new Date();

  // Transaction 1: COMPLETE - High-Value Real Estate Conveyance (G.R. No. 241014-SC)
  const tx1: EnfTransaction = {
    id: 'tx_enf_completed_001',
    tenantId: 'tenant_sc_ph',
    clientId: 'usr_client_valdez',
    grNumber: 'G.R. No. 241014-SC',
    documentTitle: 'Deed of Absolute Sale - Makati Commercial Parcel',
    state: 'COMPLETE',
    serviceMode: 'REN',
    actType: 'ACKNOWLEDGMENT',
    actClassificationSource: 'ENP_CONFIRMED',
    actClassificationConfidence: 99.8,
    assignedEnpId: 'usr_enp_santos',
    assignedEnpName: 'Atty. Maria Santos (Roll #78492)',
    participants: [
      {
        id: 'part_001_principal',
        transactionId: 'tx_enf_completed_001',
        fullName: 'Engr. Antonio M. Valdez',
        email: 'antonio.valdez@manilaproperties.ph',
        phone: '+63 917 555 0101',
        role: 'PRINCIPAL',
        identityStatus: 'VERIFIED',
        consentGiven: true,
        signatureApplied: true,
        signatureTimestamp: new Date(now.getTime() - 86400000).toISOString(),
        signatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      }
    ],
    documentVersions: [
      {
        documentVersionId: 'v1_tx001',
        documentId: 'doc_tx001',
        transactionId: 'tx_enf_completed_001',
        versionNumber: 1,
        versionStage: 'Version 1 - Uploaded',
        hashAlgorithm: 'SHA-256',
        contentHash: 'f4b5d21a99b8214f8812c3b245e89134a41b2c4519f78324e9301daef4431289',
        size: 1048576,
        mimeType: 'application/pdf',
        storageReference: 'vault://sc-ph-east/tenant_sc_ph/tx001/v1.pdf',
        createdAt: new Date(now.getTime() - 172800000).toISOString(),
        createdByUserId: 'usr_client_valdez',
        isSignedOrSealed: false
      },
      {
        documentVersionId: 'v6_tx001',
        documentId: 'doc_tx001',
        transactionId: 'tx_enf_completed_001',
        versionNumber: 6,
        versionStage: 'Version 6 - Notarized PDF/A',
        hashAlgorithm: 'SHA-256',
        contentHash: 'a89c31405e32b001a1f721bc6924ff902b48e35198df2410a84e31109dc09477',
        size: 1320000,
        mimeType: 'application/pdf',
        storageReference: 'vault://sc-ph-east/tenant_sc_ph/tx001/v6_sealed.pdf',
        createdAt: new Date(now.getTime() - 86400000).toISOString(),
        createdByUserId: 'usr_enp_santos',
        isSignedOrSealed: true
      }
    ],
    currentDocumentHash: 'a89c31405e32b001a1f721bc6924ff902b48e35198df2410a84e31109dc09477',
    jurisdictionStatus: 'VERIFIED',
    jurisdictionEvidence: {
      latitude: 14.5995,
      longitude: 120.9842,
      country: 'Philippines',
      city: 'Manila',
      ipAddress: '120.29.74.19',
      vpnDetected: false,
      proxyDetected: false,
      timezone: 'Asia/Manila',
      riskFlags: []
    },
    appearanceRecord: {
      sessionId: 'sess_ren_tx001',
      transactionId: 'tx_enf_completed_001',
      mode: 'REN',
      enpId: 'usr_enp_santos',
      startedAt: new Date(now.getTime() - 86400000).toISOString(),
      completedAt: new Date(now.getTime() - 85200000).toISOString(),
      appearanceConfirmed: true,
      participantsPresent: [
        {
          participantId: 'part_001_principal',
          fullName: 'Engr. Antonio M. Valdez',
          role: 'PRINCIPAL',
          present: true,
          identityConfirmedByEnp: true,
          voluntarinessConfirmed: true
        }
      ],
      evidenceReference: 'VAULT_APPEARANCE_sess_ren_tx001',
      sessionContinuityMaintained: true
    },
    statutoryNotarialFee: 500.0,
    commercialPlatformFee: 350.0,
    totalFee: 850.0,
    paymentSettled: true,
    regulatorySyncStatus: 'COMPLETED',
    evidencePackageId: 'EV_PKG_tx_enf_completed_001',
    createdAt: new Date(now.getTime() - 172800000).toISOString(),
    updatedAt: new Date(now.getTime() - 85000000).toISOString(),
    completedAt: new Date(now.getTime() - 85000000).toISOString()
  };

  const cert1: NotarialCertificateRecord = {
    id: 'cert_tx_enf_completed_001',
    transactionId: 'tx_enf_completed_001',
    enpId: 'usr_enp_santos',
    certificateNumber: 'CERT-SC-2025-00891',
    actType: 'ACKNOWLEDGMENT',
    mode: 'REN',
    documentHash: tx1.currentDocumentHash,
    issuedAt: new Date(now.getTime() - 85200000).toISOString(),
    enpCredentialSnapshot: {
      fullName: 'Atty. Maria Santos',
      rollOfAttorneysNumber: '78492',
      ibpNumber: 'IBP-NCR-2024-99128',
      commissionNumber: 'ENP-RTC-MNL-2024-001',
      territory: 'RTC Branch 41, National Capital Judicial Region'
    },
    certificateHash: '42b11e74f88192a0134cd9912800a7b11c34a90812ed3b901a884efb3419810a',
    verificationId: 'VERIF-VALDEZ-891',
    status: 'VALID'
  };

  const bookEntry1: NotarialBookEntry = {
    id: 'book_entry_001',
    tenantId: 'tenant_sc_ph',
    sequenceNumber: 2025001,
    enpId: 'usr_enp_santos',
    enpName: 'Atty. Maria Santos',
    transactionId: 'tx_enf_completed_001',
    grNumber: 'G.R. No. 241014-SC',
    actType: 'ACKNOWLEDGMENT',
    documentTitle: tx1.documentTitle,
    principalName: 'Engr. Antonio M. Valdez',
    competentEvidenceId: 'PhilSys Token #PSA-9912',
    statutoryFee: 500,
    commercialFee: 350,
    feeCharged: 850,
    serviceMode: 'REN',
    entryHash: 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
    previousEntryHash: 'GENESIS_SUPREME_COURT_RULE_VIII_ENF_LEDGER',
    timestamp: new Date(now.getTime() - 85100000).toISOString(),
    isVerified: true
  };

  enfTransactionsStore.set(tx1.id, tx1);
  enfCertificatesStore.set(cert1.id, cert1);
  enfNotarialBook.unshift(bookEntry1);

  // Transaction 2: JURISDICTION_REVIEW_REQUIRED - Overseas Signatory Proxy Risk (G.R. No. 250119-SC)
  const tx2: EnfTransaction = {
    id: 'tx_enf_review_002',
    tenantId: 'tenant_sc_ph',
    clientId: 'usr_client_valdez',
    grNumber: 'G.R. No. 250119-SC',
    documentTitle: 'Special Power of Attorney - Asset Transfer Under Conservatorship',
    state: 'JURISDICTION_REVIEW_REQUIRED',
    serviceMode: 'REN',
    actType: 'JURAT',
    assignedEnpId: 'usr_enp_santos',
    assignedEnpName: 'Atty. Maria Santos (Roll #78492)',
    participants: [
      {
        id: 'part_002_affiant',
        transactionId: 'tx_enf_review_002',
        fullName: 'Elena R. Bautista',
        email: 'elena.bautista@overseascorp.com',
        phone: '+63 918 222 3344',
        role: 'AFFIANT',
        identityStatus: 'VERIFIED',
        consentGiven: true,
        signatureApplied: false
      }
    ],
    documentVersions: [
      {
        documentVersionId: 'v1_tx002',
        documentId: 'doc_tx002',
        transactionId: 'tx_enf_review_002',
        versionNumber: 1,
        versionStage: 'Version 1 - Uploaded',
        hashAlgorithm: 'SHA-256',
        contentHash: '3b9241ac89901e12903829bb0021398f12c98a0029b47e2213459981245ff012',
        size: 512000,
        mimeType: 'application/pdf',
        storageReference: 'vault://sc-ph-east/tenant_sc_ph/tx002/v1.pdf',
        createdAt: new Date(now.getTime() - 3600000).toISOString(),
        createdByUserId: 'usr_client_valdez',
        isSignedOrSealed: false
      }
    ],
    currentDocumentHash: '3b9241ac89901e12903829bb0021398f12c98a0029b47e2213459981245ff012',
    jurisdictionStatus: 'REVIEW_REQUIRED',
    jurisdictionEvidence: {
      ipAddress: '180.191.120.4',
      country: 'Philippines',
      vpnDetected: false,
      proxyDetected: false,
      timezone: 'Asia/Manila',
      riskFlags: ['GEOLOCATION_UNAVAILABLE']
    },
    statutoryNotarialFee: 500.0,
    commercialPlatformFee: 350.0,
    totalFee: 850.0,
    paymentSettled: false,
    regulatorySyncStatus: 'NOT_SUBMITTED',
    createdAt: new Date(now.getTime() - 7200000).toISOString(),
    updatedAt: new Date(now.getTime() - 1800000).toISOString()
  };
  enfTransactionsStore.set(tx2.id, tx2);

  // Transaction 3: READY_FOR_SIGNING - Verified IEN Affidavit ready for client & ENP execution
  const tx3: EnfTransaction = {
    id: 'tx_enf_ready_003',
    tenantId: 'tenant_sc_ph',
    clientId: 'usr_client_valdez',
    grNumber: 'G.R. No. 238910-SC',
    documentTitle: 'Affidavit of Non-Tenancy & Agricultural Status',
    state: 'READY_FOR_SIGNING',
    serviceMode: 'IEN',
    actType: 'JURAT',
    actClassificationSource: 'ENP_CONFIRMED',
    actClassificationConfidence: 100,
    assignedEnpId: 'usr_enp_santos',
    assignedEnpName: 'Atty. Maria Santos (Roll #78492)',
    participants: [
      {
        id: 'part_003_affiant',
        transactionId: 'tx_enf_ready_003',
        fullName: 'Carlos P. Mendoza',
        email: 'carlos.mendoza@agrifarm.ph',
        phone: '+63 920 111 8899',
        role: 'AFFIANT',
        identityStatus: 'VERIFIED',
        consentGiven: true,
        signatureApplied: false
      }
    ],
    documentVersions: [
      {
        documentVersionId: 'v1_tx003',
        documentId: 'doc_tx003',
        transactionId: 'tx_enf_ready_003',
        versionNumber: 1,
        versionStage: 'Version 1 - Uploaded',
        hashAlgorithm: 'SHA-256',
        contentHash: '721a998124be312903829bb0021398f12c98a0029b47e2213459981245ff033a',
        size: 780000,
        mimeType: 'application/pdf',
        storageReference: 'vault://sc-ph-east/tenant_sc_ph/tx003/v1.pdf',
        createdAt: new Date(now.getTime() - 14400000).toISOString(),
        createdByUserId: 'usr_client_valdez',
        isSignedOrSealed: false
      }
    ],
    currentDocumentHash: '721a998124be312903829bb0021398f12c98a0029b47e2213459981245ff033a',
    jurisdictionStatus: 'VERIFIED',
    appearanceRecord: {
      sessionId: 'sess_ien_tx003',
      transactionId: 'tx_enf_ready_003',
      mode: 'IEN',
      enpId: 'usr_enp_santos',
      startedAt: new Date(now.getTime() - 7200000).toISOString(),
      completedAt: new Date(now.getTime() - 6000000).toISOString(),
      appearanceConfirmed: true,
      participantsPresent: [
        {
          participantId: 'part_003_affiant',
          fullName: 'Carlos P. Mendoza',
          role: 'AFFIANT',
          present: true,
          identityConfirmedByEnp: true,
          voluntarinessConfirmed: true
        }
      ],
      evidenceReference: 'VAULT_APPEARANCE_sess_ien_tx003'
    },
    statutoryNotarialFee: 500.0,
    commercialPlatformFee: 350.0,
    totalFee: 850.0,
    paymentSettled: false,
    regulatorySyncStatus: 'NOT_SUBMITTED',
    createdAt: new Date(now.getTime() - 14400000).toISOString(),
    updatedAt: new Date(now.getTime() - 3600000).toISOString()
  };
  enfTransactionsStore.set(tx3.id, tx3);

  // Transaction 4: UPCOMING REN - Appearance Scheduled
  const tx4: EnfTransaction = {
    id: 'tx_enf_upcoming_004',
    tenantId: 'tenant_sc_ph',
    clientId: 'usr_client_valdez',
    grNumber: 'G.R. No. 248900-SC',
    documentTitle: 'Joint Affidavit of Two Disinterested Persons',
    state: 'APPEARANCE_SCHEDULED',
    serviceMode: 'REN',
    assignedEnpId: 'usr_enp_santos',
    assignedEnpName: 'Atty. Maria Santos (Roll #78492)',
    participants: [
      {
        id: 'part_004_wit1',
        transactionId: 'tx_enf_upcoming_004',
        fullName: 'Dr. Fernando Gomez',
        email: 'fgomez@hospital.ph',
        phone: '+63 919 444 7788',
        role: 'WITNESS',
        identityStatus: 'VERIFIED',
        consentGiven: true,
        signatureApplied: false
      }
    ],
    documentVersions: [
      {
        documentVersionId: 'v1_tx004',
        documentId: 'doc_tx004',
        transactionId: 'tx_enf_upcoming_004',
        versionNumber: 1,
        versionStage: 'Version 1 - Uploaded',
        hashAlgorithm: 'SHA-256',
        contentHash: 'c45b8912903829bb0021398f12c98a0029b47e2213459981245ff033a9082211',
        size: 620000,
        mimeType: 'application/pdf',
        storageReference: 'vault://sc-ph-east/tenant_sc_ph/tx004/v1.pdf',
        createdAt: new Date(now.getTime() - 86400000).toISOString(),
        createdByUserId: 'usr_client_valdez',
        isSignedOrSealed: false
      }
    ],
    currentDocumentHash: 'c45b8912903829bb0021398f12c98a0029b47e2213459981245ff033a9082211',
    jurisdictionStatus: 'VERIFIED',
    statutoryNotarialFee: 500.0,
    commercialPlatformFee: 350.0,
    totalFee: 850.0,
    paymentSettled: false,
    regulatorySyncStatus: 'NOT_SUBMITTED',
    createdAt: new Date(now.getTime() - 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 10000000).toISOString()
  };
  enfTransactionsStore.set(tx4.id, tx4);
}
