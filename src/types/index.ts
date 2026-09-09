export interface EmailAddress {
  name: string;
  address: string;
  isSphereInternal?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  storageUrl?: string;
  storageNodeId?: string;
  checksum?: string;
  isEncrypted?: boolean;
}

export interface SecurityMetadata {
  isLoopinOfficial?: boolean;
  officialCategory?: 'security_alert' | 'login_alert' | 'verification' | 'moderation' | 'account_activity';
  spfVerified: boolean;
  dkimVerified: boolean;
  dmarcStatus: 'pass' | 'neutral' | 'fail';
  encryptedAtRest: boolean;
  tlsDelivery: boolean;
  zeroKnowledgeIsolation: boolean;
}

export interface DeliveryStatus {
  status: 'delivered' | 'internal_delivered' | 'queued_smtp_unconfigured' | 'failed' | 'draft';
  transportDiagnostics: string;
  queuedAt?: string;
  deliveredAt?: string;
  nodeRoute?: string;
}

export interface Email {
  id: string;
  sender: EmailAddress;
  recipients: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  preview: string;
  bodyHtml: string;
  bodyPlain: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  folder: 'inbox' | 'starred' | 'sent' | 'drafts' | 'archive' | 'spam' | 'trash' | string;
  tags: string[];
  attachments: Attachment[];
  security: SecurityMetadata;
  deliveryStatus?: DeliveryStatus;
}

export interface UserAccount {
  userId: string;
  mailboxId: string;
  loopinAccountId: string;
  username: string;
  displayName: string;
  sphereEmail: string;
  avatarUrl?: string;
  isVerified: boolean;
  tier: 'standard' | 'founder' | 'sovereign';
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLoginIp: string;
  suspiciousActivityCount: number;
}

export interface PersonalServerFile {
  id: string;
  name: string;
  size: number;
  type: 'file' | 'image' | 'doc' | 'archive' | 'audio';
  category: 'mail_attachment' | 'personal_file' | 'document' | 'vault';
  uploadedAt: string;
  encrypted: boolean;
  storageNodeId: string;
}

export interface ConnectedService {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'standby' | 'disconnected';
  zeroKnowledgeIsolation: boolean;
  description: string;
}

export interface PersonalDigitalServer {
  serverId: string;
  status: 'online' | 'isolated' | 'syncing';
  nodeCluster: string;
  logicalIsolation: boolean;
  encryptionAlgorithm: string;
  storage: {
    usedBytes: number;
    allocatedVirtualBytes: number;
    targetVisionCapacity: string; // e.g. "Up to 1 YB (visionary architectural ceiling)"
    realPhysicalQuotaBytes: number; // e.g. 50 GB actual allocated disk on this node
    breakdown: {
      emails: number;
      attachments: number;
      personalFiles: number;
      vaultEncrypted: number;
    };
  };
  files: PersonalServerFile[];
  connectedServices: ConnectedService[];
  recentActivity: Array<{
    id: string;
    event: string;
    timestamp: string;
    ip: string;
    status: 'authorized' | 'flagged' | 'blocked';
    details: string;
  }>;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  reason: string;
  timestamp: string;
  targetScope: string;
  privateContentProtected: boolean;
}

// =============================================================
// DATABASE MODELS REQUIRED BY SPHERE MAIL & LOOPIN INTERNAL API
// =============================================================

export interface User {
  id: string; // Permanent internal User ID (e.g. usr_sph_...)
  loopinAccountId: string; // Linked sovereign Loopin ID
  username: string;
  displayName: string;
  primaryEmail: string; // Sphere sovereign mailbox address
  tier: 'standard' | 'founder' | 'sovereign';
  status: 'active' | 'restricted' | 'suspended' | 'removed';
  isVerified: boolean;
  twoFactorEnabled: boolean;
  securityEnclaveId: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  lastLoginIp: string;
}

export interface Mailbox {
  id: string; // Permanent internal Mailbox ID (e.g. mbx_sph_...)
  userId: string; // Foreign key -> User.id
  address: string; // full address e.g. alex.mercer@yourname.com
  domain: string;
  status: 'active' | 'quarantined' | 'restricted' | 'suspended';
  storageNodeId: string;
  storageQuotaBytes: number; // Physical baseline allocation (e.g. 50 GB)
  virtualCapacityCeiling: string; // "Up to 1 YB (sparse zero-knowledge virtual addressing)"
  encryptionSuite: string; // "XChaCha20-Poly1305 / Hardware Enclave"
  zeroKnowledgeIsolation: boolean; // Never exposed to external or Loopin social API
  createdAt: string;
  updatedAt: string;
}

export interface Verification {
  id: string; // Verification record ID
  userId?: string; // Optional user linkage
  targetAddress: string; // Email or phone verified
  purpose: 'sphere_registration' | 'login_2fa' | 'password_reset' | 'enclave_rekey' | 'email_bind';
  codeHash: string; // Salted cryptographic hash (NEVER stored plaintext)
  salt: string;
  expiresAt: string; // ISO timestamp
  attempts: number; // Counter for rate-limiting
  maxAttempts: number; // Default 5
  isConfirmed: boolean;
  confirmedAt?: string;
  requestIp: string;
  serviceId: string; // Originating Loopin service
  createdAt: string;
}

export interface Service {
  id: string; // e.g. "svc_sphere_auth", "svc_sphere_trust_safety"
  name: string;
  category: 'authentication' | 'trust_safety' | 'security_enclave' | 'support' | 'core_platform';
  description: string;
  status: 'active' | 'suspended' | 'deprecated';
  rateLimitPerMinute: number;
  allowedScopes: string[];
  createdAt: string;
}

export interface ServiceCredential {
  id: string;
  serviceId: string;
  keyId: string;
  apiKeyHash: string; // Salted SHA-256 hash of service key
  keyPrefix: string; // First 8 chars for logging (e.g. "sph_svc_auth_...")
  scopes: string[]; // ['verification:send', 'verification:confirm', 'mail:system:send', 'mailbox:read']
  status: 'active' | 'revoked' | 'expired';
  expiresAt: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface AuditLog {
  id: string;
  serviceId: string;
  action: 'verification_send' | 'verification_confirm' | 'mail_system_send' | 'mailbox_read' | 'token_issue';
  status: 'success' | 'denied' | 'rate_limited' | 'error';
  targetUserId?: string;
  targetMailboxId?: string;
  scopesVerified: string[];
  ip: string;
  latencyMs: number;
  details: string;
  privateContentProtected: boolean; // Strictly true: mailbox contents never leaked
  timestamp: string;
}

// System Email Templates Enum and Types
export type SystemEmailTemplateId =
  | 'VERIFICATION'
  | 'WELCOME'
  | 'SECURITY'
  | 'WARNING'
  | 'RESTRICTION'
  | 'BAN'
  | 'REMOVAL'
  | 'APPEAL_RECEIVED'
  | 'APPEAL_APPROVED'
  | 'APPEAL_REJECTED'
  | 'REPORT_RESULT_ACTION'
  | 'REPORT_RESULT_NO_ACTION';

export interface SystemEmailRequest {
  to: string; // Recipient email or User ID
  templateId: SystemEmailTemplateId;
  variables: Record<string, string | number>;
  priority?: 'normal' | 'high' | 'urgent';
  caseId?: string;
}

export interface MailSystemConfig {
  domain: string;
  parentCompany: string;
  productName: string;
  tagline: string;
  smtpRelayConfigured: boolean;
  objectStorageConnected: boolean;
  version: string;
  architectureTiers: {
    metadataStorage: string;
    bodyStorage: string;
    attachmentStorage: string;
    personalServerEngine: string;
  };
}

