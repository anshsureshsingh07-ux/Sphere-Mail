import { MailSystemConfig } from '../types';

/**
 * SPHERE MAIL CENTRAL CONFIGURATION
 * 
 * Central source of truth for Sphere Mail by Loopin.
 * Domain, storage limits, and architecture parameters can be configured here or via environment variables.
 */
export const SPHERE_CONFIG: MailSystemConfig = {
  domain: (typeof process !== 'undefined' && process.env?.SPHERE_MAIL_DOMAIN) || 'spheremail.net',
  parentCompany: 'Loopin',
  productName: 'Sphere Mail',
  tagline: 'Your mail for Sphere',
  smtpRelayConfigured: false, // Honest state: outbound relay to external ISPs requires customer/infra SMTP credentials
  objectStorageConnected: true,
  version: '2.4.0-sovereign',
  architectureTiers: {
    metadataStorage: 'Encrypted Metadata Database (PostgreSQL / Distributed Key-Value)',
    bodyStorage: 'Isolated Mail Enclave Store',
    attachmentStorage: 'Zero-Knowledge Object Storage Clusters',
    personalServerEngine: 'User-Isolated Virtual Server Instance',
  },
};

/**
 * Storage philosophy parameters:
 * - Visionary ceiling: Up to 1 YB (dynamic expansion scaling on physical capacity)
 * - Actual baseline provisioned quota: 50 GB
 * - Prevents fake allocation while illustrating the dynamic horizontal scaling architecture
 */
export const STORAGE_PHILOSOPHY = {
  targetVisionCapacityLabel: 'Up to 1 YB Target Vision',
  baselinePhysicalQuotaBytes: 50 * 1024 * 1024 * 1024, // 50 GB
  isExpandable: true,
  policyStatement: 'Sphere allocates real physical storage from node clusters on demand. We do not falsely claim infinite physical disk or pre-allocate non-existent exabytes.',
};
