import { Email, MailSystemConfig, PersonalDigitalServer, UserAccount } from '../types';

const TOKEN_KEY = 'sphere_mail_session_token';
const USER_KEY = 'sphere_mail_cached_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getStoredUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserAccount) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data;
}

export const api = {
  // Config
  getConfig: () => request<MailSystemConfig & { storagePhilosophy: any }>('/api/config'),

  // Auth
  getCurrentUser: () => request<{ user: UserAccount }>('/api/auth/me'),
  getIdentities: () =>
    request<{ accounts: Array<{ email: string; displayName: string; tier: string; username: string }> }>(
      '/api/auth/identities'
    ),

  login: async (emailOrUsername: string, password: string, twoFactorCode?: string) => {
    const res = await request<{ token: string; user: UserAccount; securityNotice?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password, twoFactorCode }),
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    if (res.user) {
      setStoredUser(res.user);
    }
    return res;
  },

  register: async (emailOrUsername: string, password: string, displayName?: string, customDomain?: string) => {
    const res = await request<{ token: string; user: UserAccount }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        emailOrUsername,
        username: emailOrUsername,
        email: emailOrUsername,
        customDomain,
        password,
        displayName: displayName || emailOrUsername,
      }),
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    if (res.user) {
      setStoredUser(res.user);
    }
    return res;
  },

  logout: async () => {
    clearStoredToken();
  },

  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,

  // Emails
  getEmails: (
    optionsOrFolder: { folder?: string; search?: string; tag?: string; unreadOnly?: boolean } | string = 'inbox',
    search = '',
    tag = '',
    unreadOnly = false
  ) => {
    let folderParam = 'inbox';
    let searchParam = '';
    let tagParam = '';
    let unreadParam = false;

    if (typeof optionsOrFolder === 'object') {
      folderParam = optionsOrFolder.folder || 'inbox';
      searchParam = optionsOrFolder.search || '';
      tagParam = optionsOrFolder.tag || '';
      unreadParam = !!optionsOrFolder.unreadOnly;
    } else {
      folderParam = optionsOrFolder;
      searchParam = search;
      tagParam = tag;
      unreadParam = unreadOnly;
    }

    const params = new URLSearchParams({
      folder: folderParam,
      search: searchParam,
      tag: tagParam,
      unreadOnly: String(unreadParam),
    });
    return request<{ emails: Email[]; unreadCounts: { inbox: number; starred: number; spam: number } }>(
      `/api/emails?${params.toString()}`
    );
  },

  getEmail: (id: string) => request<{ email: Email }>(`/api/emails/${id}`),

  sendEmail: (payload: {
    recipients: Array<{ name: string; address: string; isSphereInternal?: boolean }>;
    cc?: Array<{ name: string; address: string }>;
    bcc?: Array<{ name: string; address: string }>;
    subject: string;
    bodyHtml: string;
    bodyPlain: string;
    attachments?: any[];
    isDraft?: boolean;
  }) =>
    request<{ email: Email; deliveryStatus: any; message: string }>('/api/emails', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateEmail: (id: string, partial: { isStarred?: boolean; isRead?: boolean; folder?: string; tagToAdd?: string; tagToRemove?: string }) =>
    request<{ email: Email }>(`/api/emails/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(partial),
    }),

  markAsRead: (ids: string[], isRead: boolean) =>
    request<{ success: boolean; affected: number }>('/api/emails/bulk', {
      method: 'POST',
      body: JSON.stringify({ ids, action: isRead ? 'mark_read' : 'mark_unread' }),
    }),

  starEmail: (id: string, isStarred: boolean) =>
    request<{ email: Email }>(`/api/emails/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isStarred }),
    }),

  moveEmails: (ids: string[], targetFolder: string) =>
    request<{ success: boolean; affected: number }>('/api/emails/bulk', {
      method: 'POST',
      body: JSON.stringify({
        ids,
        action: targetFolder === 'trash' ? 'trash' : targetFolder === 'archive' ? 'archive' : targetFolder === 'spam' ? 'spam' : 'move',
        targetFolder,
      }),
    }),

  bulkAction: (ids: string[], action: 'mark_read' | 'mark_unread' | 'star' | 'unstar' | 'archive' | 'trash' | 'spam' | 'move' | 'delete_permanent', targetFolder?: string) =>
    request<{ success: boolean; affected: number }>('/api/emails/bulk', {
      method: 'POST',
      body: JSON.stringify({ ids, action, targetFolder }),
    }),

  // Personal Digital Server
  getPersonalServer: async () => {
    const res = await request<{ server: PersonalDigitalServer }>('/api/personal-server');
    return res.server;
  },

  uploadPersonalServerFile: (fileData: { name: string; size: number; category?: string; type?: string }) =>
    request<{ file: any }>('/api/personal-server/files', {
      method: 'POST',
      body: JSON.stringify(fileData),
    }),

  // Admin Portal & Zero-Knowledge Diagnostics
  getAdminMetrics: () => request<any>('/api/admin/metrics'),

  submitAdminAuditRequest: (action: string, reason: string, targetScope: string) =>
    request<{ success: boolean; record: any }>('/api/admin/audit-request', {
      method: 'POST',
      body: JSON.stringify({ action, reason, targetScope }),
    }),

  // Sphere Platform Integration Dispatch
  dispatchOfficialNotice: (targetEmail: string, category: string, title: string, content: string) =>
    request<{ success: boolean; email: Email }>('/api/sphere/dispatch-official-notice', {
      method: 'POST',
      body: JSON.stringify({ targetEmail, category, title, content }),
    }),

  // =============================================================
  // LOOPIN INTERNAL API (SERVER-TO-SERVER ENCLAVE METHODS)
  // =============================================================

  // POST /internal/verification/send
  sendVerificationOtp: (payload: { to: string; purpose?: string; expiry_minutes?: number; user_id?: string }) =>
    request<{
      success: boolean;
      verification_id: string;
      target: string;
      purpose: string;
      expires_in_minutes: number;
      expires_at: string;
      status: string;
      email_dispatched?: any;
      security: any;
    }>('/api/internal/verification/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // POST /internal/verification/confirm
  confirmVerificationOtp: (payload: { verification_id: string; code: string }) =>
    request<{
      success: boolean;
      verified: boolean;
      verification_id: string;
      target: string;
      user_id?: string;
      mailbox_id?: string;
      confirmed_at: string;
    }>('/api/internal/verification/confirm', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // POST /internal/mail/send-system
  sendSystemMail: (payload: {
    to: string;
    template_id: string;
    variables?: Record<string, string | number>;
    priority?: string;
    case_id?: string;
  }) =>
    request<{
      success: boolean;
      email_id: string;
      recipient: string;
      mailbox_id: string;
      user_id?: string;
      template_id: string;
      subject: string;
      priority: string;
      delivered_at: string;
      transport: string;
    }>('/api/internal/mail/send-system', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // GET /internal/users/{user_id}/mailbox
  getUserMailboxMetadata: (userId: string) =>
    request<{
      user_id: string;
      mailbox_id: string;
      loopin_account_id: string;
      username: string;
      display_name: string;
      sphere_email: string;
      status: string;
      tier: string;
      is_verified: boolean;
      two_factor_enabled: boolean;
      storage: {
        real_physical_quota_bytes: number;
        virtual_capacity_vision: string;
        encryption_suite: string;
        baseline_quota_formatted: string;
      };
      zero_knowledge_isolation: boolean;
      privacy_guarantee: string;
    }>(`/api/internal/users/${encodeURIComponent(userId)}/mailbox`),

  // Developer & Architecture Enclave
  getInternalServices: () => request<{ services: any[] }>('/api/internal/services'),
  getInternalAuditLogs: () => request<{ logs: any[] }>('/api/internal/audit-logs'),
  getInternalTemplates: () => request<{ templates: any[] }>('/api/internal/templates'),
  getVirtualStorageArchitecture: () => request<{ architecture: any; telemetry: any }>('/api/storage/virtual-architecture'),
  getInternalDocs: () => request<any>('/api/internal/docs'),
  issueInternalToken: (service_id: string, scopes: string[] = ['*'], ttl_seconds = 3600) =>
    request<any>('/api/internal/auth/token', {
      method: 'POST',
      body: JSON.stringify({ service_id, scopes, ttl_seconds }),
    }),
};

