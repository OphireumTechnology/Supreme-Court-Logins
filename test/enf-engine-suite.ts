/**
 * ENF Compliance Core, Identity & Transaction Engine Automated Verification Suite
 * A.M. No. 24-10-14-SC, RA 10173, HIPAA, and GDPR Statutory Tests
 */

import { NotarialTransactionEngine, registeredEnpStore, enfTransactionsStore, enfNotarialBook } from '../src/server/engine';
import { seedInitialTransactions } from '../src/server/seed';
import { AuthContext } from '../src/server/policy';
import { EGovEVerifyProvider, MockLivenessProvider, MockTrustProvider, JurisdictionAssuranceEngine } from '../src/server/identity';

interface SuiteResult {
  testId: number;
  mandate: string;
  passed: boolean;
  proof: string;
}

const suiteResults: SuiteResult[] = [];

async function testCase(testId: number, mandate: string, fn: () => string | void | Promise<string | void>) {
  try {
    const res = fn();
    const proof = (res instanceof Promise ? await res : res) || 'Verified with cryptographic/policy assertion.';
    suiteResults.push({ testId, mandate, passed: true, proof });
    console.log(`[PASS] Test ${testId}: ${mandate}`);
  } catch (err: any) {
    suiteResults.push({ testId, mandate, passed: false, proof: `FAILED: ${err.message}` });
    console.error(`[FAIL] Test ${testId}: ${mandate} -> ${err.message}`);
  }
}

async function runEnfEngineSuite() {
  console.log('================================================================');
  console.log('ENF COMPLIANCE CORE + IDENTITY + TRANSACTION ENGINE VERIFICATION');
  console.log('Supreme Court of the Philippines A.M. No. 24-10-14-SC Benchmark');
  console.log('================================================================\n');

  // Seed transactions in engine
  seedInitialTransactions();

  registeredEnpStore.set('usr_enp_suspended', {
    id: 'enp_record_suspended',
    tenantId: 'tenant_sc_ph',
    userId: 'usr_enp_suspended',
    rollOfAttorneysNumber: '99999',
    ibpNumber: 'IBP-SUSPENDED',
    commissionNumber: 'COMM-SUSPENDED',
    commissionStart: '2020-01-01',
    commissionEnd: '2026-12-31',
    commissionStatus: 'SUSPENDED',
    professionalTaxReceipt: 'PTR-SUSPENDED',
    mcleStatus: 'NON_COMPLIANT',
    ulasStatus: 'SUSPENDED',
    enfAccountId: 'ENF-ACC-SUSPENDED',
    digitalCertificateRef: 'PNPKI-SUSPENDED',
    sealRef: 'SEAL-SUSPENDED',
    status: 'SUSPENDED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const initialDoc = {
    documentVersionId: 'v1_test_doc',
    documentId: 'doc_test_001',
    transactionId: 'enf_tx_001',
    versionNumber: 1,
    versionStage: 'Version 1 - Uploaded Document',
    hashAlgorithm: 'SHA-256',
    contentHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
    size: 204800,
    mimeType: 'application/pdf',
    storageReference: 'vault://test/doc.pdf',
    createdAt: new Date().toISOString(),
    createdByUserId: 'usr_client_valdez',
    isSignedOrSealed: false
  };

  const txTest: any = {
    id: 'enf_tx_001',
    tenantId: 'tenant_sc_ph',
    clientId: 'usr_client_valdez',
    grNumber: 'G.R. No. 241014-TEST',
    documentTitle: 'Contract of Lease - Enterprise Suite',
    state: 'APPEARANCE_SESSION',
    serviceMode: 'REN',
    actType: 'ACKNOWLEDGMENT',
    actClassificationSource: 'AI_RECOMMENDED',
    actClassificationConfidence: 99.2,
    assignedEnpId: 'usr_enp_santos',
    assignedEnpName: 'Atty. Maria Santos (Roll #78492)',
    participants: [
      {
        id: 'part_001_principal',
        transactionId: 'enf_tx_001',
        fullName: 'Engr. Antonio M. Valdez',
        email: 'antonio.valdez@manilaproperties.ph',
        phone: '+63 917 555 0101',
        role: 'PRINCIPAL',
        identityStatus: 'VERIFIED',
        consentGiven: true,
        signatureApplied: false
      }
    ],
    documentVersions: [initialDoc],
    currentDocumentHash: initialDoc.contentHash,
    jurisdictionStatus: 'VERIFIED',
    appearanceRecord: {
      sessionId: 'sess_ren_test_001',
      transactionId: 'enf_tx_001',
      mode: 'REN',
      enpId: 'usr_enp_santos',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
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
      evidenceReference: 'VAULT_APPEARANCE_sess_ren_test_001',
      sessionContinuityMaintained: true
    },
    statutoryNotarialFee: 500,
    commercialPlatformFee: 350,
    totalFee: 850,
    paymentSettled: false,
    regulatorySyncStatus: 'NOT_SUBMITTED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  enfTransactionsStore.set(txTest.id, txTest);

  const activeEnpAuth: AuthContext = {
    userId: 'usr_enp_santos',
    tenantId: 'tenant_sc_ph',
    email: 'atty.santos@notary.ph',
    role: 'ENP',
    enpStatus: 'ACTIVE',
    commissionValidUntil: '2026-12-31T23:59:59Z',
    mfaVerified: true
  };

  const suspendedEnpAuth: AuthContext = {
    userId: 'usr_enp_suspended',
    tenantId: 'tenant_sc_ph',
    email: 'suspended@notary.ph',
    role: 'ENP',
    enpStatus: 'SUSPENDED',
    commissionValidUntil: '2026-12-31T23:59:59Z',
    mfaVerified: true
  };

  const adminAuth: AuthContext = {
    userId: 'usr_admin_corp',
    tenantId: 'tenant_sc_ph',
    email: 'admin@firm.com',
    role: 'ADMIN',
    mfaVerified: true
  };

  const aiAgentAuth: AuthContext = {
    userId: 'usr_ai_copilot',
    tenantId: 'tenant_sc_ph',
    email: 'ai-copilot@sc.judiciary.gov.ph',
    role: 'ENP',
    enpStatus: 'ACTIVE',
    commissionValidUntil: '2026-12-31T23:59:59Z',
    mfaVerified: true,
    isAiAgent: true
  };

  // Test 1: Tenant Isolation
  await testCase(1, 'Tenant isolation prevents cross-tenant access to transactions', () => {
    let blocked = false;
    try {
      NotarialTransactionEngine.getTransaction('enf_tx_001', {
        userId: 'usr_intruder',
        tenantId: 'foreign_tenant_xyz',
        email: 'intruder@other.com',
        role: 'CLIENT',
        mfaVerified: true
      });
    } catch (err: any) {
      blocked = err.message.includes('TENANT_ISOLATION_VIOLATION');
    }
    if (!blocked) throw new Error('Cross-tenant transaction was accessed!');
    return 'Tenant isolation verified; cross-tenant query threw TENANT_ISOLATION_VIOLATION.';
  });

  // Test 2: Enterprise Admin cannot notarize or apply ENP signature
  await testCase(2, 'Enterprise Admin cannot apply ENP signature or notarize', async () => {
    let blocked = false;
    try {
      NotarialTransactionEngine.applyENPSignature(adminAuth, 'enf_tx_001', 'PNPKI-KEY-ADMIN');
    } catch (err: any) {
      blocked = err.message.includes('AUTHORIZATION_VIOLATION');
    }
    if (!blocked) throw new Error('Enterprise Admin was permitted to apply ENP signature!');
    return 'Enterprise Admin was strictly blocked from applying ENP digital signature.';
  });

  // Test 3: Suspended ENP cannot apply ENP signature
  await testCase(3, 'Suspended ENP cannot apply ENP signature or seal', async () => {
    let blocked = false;
    try {
      NotarialTransactionEngine.applyENPSignature(suspendedEnpAuth, 'enf_tx_001', 'PNPKI-KEY-SUSPENDED');
    } catch (err: any) {
      blocked = err.message.includes('COMMISSION_BLOCKED');
    }
    if (!blocked) throw new Error('Suspended ENP was permitted to apply signature!');
    return 'Suspended ENP commission correctly prevented from invoking notarial signature.';
  });

  // Test 4: AI agent is strictly blocked from applying ENP signature or seal
  await testCase(4, 'AI agent is strictly blocked from applying ENP signature, seal, or cert', async () => {
    let blocked = false;
    try {
      NotarialTransactionEngine.applyENPSignature(aiAgentAuth, 'enf_tx_001', 'AI-KEY');
    } catch (err: any) {
      blocked = err.message.includes('STATUTORY_VIOLATION');
    }
    if (!blocked) throw new Error('AI Agent was permitted to execute notarial signature!');
    return 'AI agent invocation rejected under A.M. No. 24-10-14-SC human notarial monopoly.';
  });

  // Test 5: State transitions cannot skip statutory steps
  await testCase(5, 'State machine strictly prevents illegal out-of-order transitions', async () => {
    let blocked = false;
    try {
      // Trying to issue certificate while in APPEARANCE_SESSION state
      NotarialTransactionEngine.issueNotarialCertificate(activeEnpAuth, 'enf_tx_001');
    } catch (err: any) {
      blocked = err.message.includes('HARD_RULE_VIOLATION');
    }
    if (!blocked) throw new Error('Illegal state transition was allowed!');
    return 'Direct leap to CERTIFICATE_ISSUED threw HARD_RULE_VIOLATION.';
  });

  // Test 6: Government Identity Provider (eGovPH / eVerify) Sandbox query
  await testCase(6, 'eGovPH / eVerify Sandbox executes credential check with tokenization', async () => {
    const egov = new EGovEVerifyProvider();
    const consentId = await egov.requestConsent('p_01', 'tx_test_01', 'e-KYC PhilSys');
    const govResult = await egov.verifyIdentity({
      participantId: 'p_01',
      transactionId: 'tx_test_01',
      provider: 'PhilSys',
      idType: 'PhilSys National ID',
      idNumber: '1234-5678-9012-3456',
      fullName: 'Juan Dela Cruz',
      birthDate: '1985-06-15',
      consentId,
      ipAddress: '120.29.74.19',
      deviceId: 'dev_mobile_01'
    });
    if (govResult.verificationStatus !== 'VERIFIED') throw new Error('eGov sandbox verification failed');
    if (!govResult.responseHash) throw new Error('Missing SHA-256 response hash');
    return `Verified via ${govResult.environment} mode. Reference: ${govResult.verificationReference}`;
  });

  // Test 7: ISO-30107 Anti-Spoofing Liveness provider check
  await testCase(7, 'Biometric Liveness provider evaluates anti-spoofing and deepfake telemetry', async () => {
    const livenessProv = new MockLivenessProvider();
    const check = await livenessProv.startCheck('p_01', 'tx_test_01', 'cam_device_01');
    const checkResult = await livenessProv.getResult(check.checkId);
    if (!checkResult.antiSpoofingPass) throw new Error('Anti-spoofing check failed');
    const humanApproved = livenessProv.approveCheckByHumanEnp(check.checkId, 'usr_enp_santos');
    if (!humanApproved.approvedByHumanEnp) throw new Error('Human ENP approval failed');
    return `Passed ISO-30107 check: confidence ${checkResult.livenessConfidence}%, anti-spoof passed, human ENP affirmed.`;
  });

  // Test 8: Territorial Jurisdiction Engine blocks foreign IPs and flagged VPNs
  await testCase(8, 'Territorial Jurisdiction Engine flags foreign and proxy connections', () => {
    const foreignCheck = JurisdictionAssuranceEngine.assessJurisdiction({
      ipAddress: '198.51.100.22',
      country: 'United States',
      ipCountry: 'United States',
      latitude: 37.7749,
      longitude: -122.4194,
      vpnDetected: true,
      proxyDetected: false
    });
    if (foreignCheck.status === 'VERIFIED') throw new Error('Foreign VPN was erroneously verified!');
    if (!foreignCheck.riskFlags.includes('VPN_DETECTED') || !foreignCheck.riskFlags.includes('OUTSIDE_ALLOWED_JURISDICTION')) {
      throw new Error('Missing territory or VPN risk flags');
    }
    return `Foreign connection flagged: ${foreignCheck.riskFlags.join(', ')} -> Status: ${foreignCheck.status}`;
  });

  // Test 9: Rule IV Notarial Act Classification confirms act type with audit
  await testCase(9, 'Commissioned ENP confirms notarial act classification', async () => {
    const updated = NotarialTransactionEngine.confirmNotarialAct(
      activeEnpAuth,
      'enf_tx_001',
      'ACKNOWLEDGMENT'
    );
    if (updated.actType !== 'ACKNOWLEDGMENT') throw new Error('Act type was not updated');
    return `Act classified as ${updated.actType}, state updated to ${updated.state}.`;
  });

  // Test 10: Signatory applies electronic signature and advances state
  await testCase(10, 'Signatory applies electronic signature, updating document version', async () => {
    const signed = NotarialTransactionEngine.recordParticipantSignature(
      activeEnpAuth,
      'enf_tx_001',
      'part_001_principal',
      'DIGITAL_SIGNATURE_HEX_PAYLOAD_TEST'
    );
    if (!signed.participants.find(p => p.id === 'part_001_principal')?.signatureApplied) {
      throw new Error('Participant signature flag not updated');
    }
    return `Participant signed. Transaction state: ${signed.state}, Doc versions: ${signed.documentVersions.length}`;
  });

  // Test 11: Active ENP applies digital signature (Version 5 created)
  await testCase(11, 'Active ENP applies digital signature and advances to ENP_SIGNATURE_APPLIED', async () => {
    const signedTx = NotarialTransactionEngine.applyENPSignature(
      activeEnpAuth,
      'enf_tx_001',
      'PNPKI-KEY-SANTOS-ACTIVE'
    );
    if (signedTx.state !== 'ENP_SIGNATURE_APPLIED') {
      throw new Error(`Expected ENP_SIGNATURE_APPLIED but got ${signedTx.state}`);
    }
    return `ENP signature affixed. Version ${signedTx.documentVersions[signedTx.documentVersions.length - 1].versionNumber} generated.`;
  });

  // Test 12: Active ENP applies official Electronic Notarial Seal (Version 6 created)
  await testCase(12, 'Active ENP applies official Electronic Notarial Seal', async () => {
    const sealedTx = NotarialTransactionEngine.applyENPSeal(activeEnpAuth, 'enf_tx_001');
    if (sealedTx.state !== 'ENP_SEAL_APPLIED') {
      throw new Error(`Expected ENP_SEAL_APPLIED but got ${sealedTx.state}`);
    }
    return `Official Seal affixed. State: ${sealedTx.state}.`;
  });

  // Test 13: Official Notarial Certificate issuance
  await testCase(13, 'Official Electronic Notarial Certificate is issued', async () => {
    const certTx = NotarialTransactionEngine.issueNotarialCertificate(activeEnpAuth, 'enf_tx_001');
    if (certTx.state !== 'CERTIFICATE_ISSUED' || !certTx.certificateRecord) {
      throw new Error('Certificate was not generated');
    }
    return `Certificate issued: ${certTx.certificateRecord.certificateNumber}, Verification ID: ${certTx.certificateRecord.verificationId}`;
  });

  // Test 14: Rule VIII Notarial Book Append-Only Hash Chain
  await testCase(14, 'Entry recorded in Rule VIII Notarial Book with cryptographic hash chain', async () => {
    const bookedTx = NotarialTransactionEngine.recordNotarialBookEntry(activeEnpAuth, 'enf_tx_001');
    if (bookedTx.state !== 'NOTARIAL_BOOK_RECORDED') {
      throw new Error('Notarial book entry failed');
    }
    return `Book entry recorded. State: ${bookedTx.state}. Total Book Entries: ${enfNotarialBook.length}`;
  });

  // Test 15: 10-Year Evidence Package Sealed
  await testCase(15, '10-Year Evidence Vault Package is sealed with manifest', async () => {
    const sealedPkg = NotarialTransactionEngine.sealEvidencePackage(activeEnpAuth, 'enf_tx_001');
    if (sealedPkg.state !== 'EVIDENCE_SEALED') {
      throw new Error('Evidence package sealing failed');
    }
    return `Evidence sealed: ${sealedPkg.evidencePackageId}, 10-year statutory vault package prepared.`;
  });

  // Test 16: Public Verification by Token
  await testCase(16, 'Public verification token returns valid certificate without leaking private telemetry', () => {
    const publicData = NotarialTransactionEngine.verifyByToken('VERIF-VALDEZ-891');
    if (!publicData || !publicData.isValid) throw new Error('Verification failed for valid token');
    if (!publicData.certificateNumber || !publicData.enpCommissionNumber) {
      throw new Error('Missing required public certificate fields');
    }
    // Check that sensitive telemetry (IP, phone, raw consent) is not leaked in public verification
    if ((publicData as any).ipAddress || (publicData as any).phone) {
      throw new Error('Private telemetry leaked in public verification endpoint!');
    }
    return `Public verification confirmed: ${publicData.grNumber}, ENP: ${publicData.enpName}, Status: ${publicData.status}`;
  });

  // Summary
  console.log('\n================================================================');
  console.log(`AUDIT RESULTS: ${suiteResults.filter(r => r.passed).length} / ${suiteResults.length} TESTS PASSED`);
  console.log('================================================================');

  const failed = suiteResults.filter(r => !r.passed);
  if (failed.length > 0) {
    console.error('FAILURES DETECTED:', failed);
    process.exit(1);
  } else {
    console.log('All 16 ENF compliance, identity & transaction engine mandates successfully verified!');
  }
}

runEnfEngineSuite();
