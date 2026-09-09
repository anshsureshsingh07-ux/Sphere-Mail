// Loopin Sphere Mail — Official System Email Templates
// Exact templates according to Sphere Integrity and Infrastructure specs

export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'verification' | 'welcome' | 'security' | 'moderation' | 'appeal' | 'report';
  defaultSubject: string;
  plainTextTemplate: string;
  requiredVariables: string[];
  badgeColor: string;
  badgeLabel: string;
}

export const SYSTEM_TEMPLATES: Record<string, TemplateDefinition> = {
  VERIFICATION: {
    id: 'VERIFICATION',
    name: 'Sphere Account Verification (OTP)',
    category: 'verification',
    defaultSubject: 'Verify your Sphere account',
    plainTextTemplate: 'Your Sphere verification code is {{otp}}. It expires in {{expiry}} minutes.',
    requiredVariables: ['otp', 'expiry'],
    badgeColor: '#8b5cf6',
    badgeLabel: 'VERIFICATION CODE',
  },
  WELCOME: {
    id: 'WELCOME',
    name: 'Sphere Welcome & Onboarding',
    category: 'welcome',
    defaultSubject: 'Welcome to Sphere',
    plainTextTemplate: 'Your Sphere account {{username}} has been successfully created and connected to Sphere Mail.',
    requiredVariables: ['username'],
    badgeColor: '#10b981',
    badgeLabel: 'ACCOUNT CREATED',
  },
  SECURITY: {
    id: 'SECURITY',
    name: 'New Login Security Alert',
    category: 'security',
    defaultSubject: 'New login detected',
    plainTextTemplate: 'A new login was detected on your Sphere account. Device: {{device}}. Time: {{time}}.',
    requiredVariables: ['device', 'time'],
    badgeColor: '#f59e0b',
    badgeLabel: 'SECURITY ALERT',
  },
  WARNING: {
    id: 'WARNING',
    name: 'Guidelines Violation Warning',
    category: 'moderation',
    defaultSubject: "Warning regarding your Sphere account",
    plainTextTemplate: "We identified activity that may violate Sphere's Community Guidelines. Case: {{case_id}}.",
    requiredVariables: ['case_id'],
    badgeColor: '#f97316',
    badgeLabel: 'COMMUNITY GUIDELINE WARNING',
  },
  RESTRICTION: {
    id: 'RESTRICTION',
    name: 'Feature Restriction Notice',
    category: 'moderation',
    defaultSubject: 'Some Sphere features have been restricted',
    plainTextTemplate: 'Your {{features}} have been temporarily restricted. Reason: {{reason}}. Case: {{case_id}}.',
    requiredVariables: ['features', 'reason', 'case_id'],
    badgeColor: '#ef4444',
    badgeLabel: 'FEATURE RESTRICTION',
  },
  BAN: {
    id: 'BAN',
    name: 'Account Suspension Notice',
    category: 'moderation',
    defaultSubject: 'Your Sphere account has been suspended',
    plainTextTemplate: 'Your account has been suspended following an Integrity review. Reason: {{reason}}. Case: {{case_id}}. Appeal available.',
    requiredVariables: ['reason', 'case_id'],
    badgeColor: '#dc2626',
    badgeLabel: 'ACCOUNT SUSPENDED',
  },
  REMOVAL: {
    id: 'REMOVAL',
    name: 'Account Permanent Removal Notice',
    category: 'moderation',
    defaultSubject: 'Your Sphere account has been removed',
    plainTextTemplate: 'Your account has been removed following an Integrity review. Reason: {{reason}}. Case: {{case_id}}. Appeal available.',
    requiredVariables: ['reason', 'case_id'],
    badgeColor: '#991b1b',
    badgeLabel: 'ACCOUNT REMOVED',
  },
  APPEAL_RECEIVED: {
    id: 'APPEAL_RECEIVED',
    name: 'Appeal Received Confirmation',
    category: 'appeal',
    defaultSubject: 'Your Sphere appeal has been received',
    plainTextTemplate: 'Your appeal has been received. Case: {{case_id}}.',
    requiredVariables: ['case_id'],
    badgeColor: '#6366f1',
    badgeLabel: 'APPEAL ACKNOWLEDGED',
  },
  APPEAL_APPROVED: {
    id: 'APPEAL_APPROVED',
    name: 'Appeal Approved Notification',
    category: 'appeal',
    defaultSubject: 'Your Sphere appeal was approved',
    plainTextTemplate: 'Your appeal has been approved and the previous enforcement has been reversed.',
    requiredVariables: [],
    badgeColor: '#059669',
    badgeLabel: 'APPEAL APPROVED',
  },
  APPEAL_REJECTED: {
    id: 'APPEAL_REJECTED',
    name: 'Appeal Upheld / Rejected Decision',
    category: 'appeal',
    defaultSubject: 'Your Sphere appeal decision',
    plainTextTemplate: 'Your appeal has been reviewed and the original enforcement decision has been upheld. Case: {{case_id}}.',
    requiredVariables: ['case_id'],
    badgeColor: '#b91c1c',
    badgeLabel: 'APPEAL UPHELD',
  },
  REPORT_RESULT_ACTION: {
    id: 'REPORT_RESULT_ACTION',
    name: 'Report Result — Enforcement Action Taken',
    category: 'report',
    defaultSubject: 'Your report has been reviewed',
    plainTextTemplate: 'Your reported account has been removed. Your report contributed to the review process. Case: {{case_id}}.',
    requiredVariables: ['case_id'],
    badgeColor: '#2563eb',
    badgeLabel: 'REPORT ENFORCEMENT',
  },
  REPORT_RESULT_NO_ACTION: {
    id: 'REPORT_RESULT_NO_ACTION',
    name: 'Report Result — No Violation Confirmed',
    category: 'report',
    defaultSubject: 'Your report has been reviewed',
    plainTextTemplate: "We couldn't confirm a violation requiring removal. Your report was still reviewed and recorded. Case: {{case_id}}.",
    requiredVariables: ['case_id'],
    badgeColor: '#64748b',
    badgeLabel: 'REPORT REVIEW RECORDED',
  },
};

export function renderTemplate(
  templateId: string,
  variables: Record<string, string | number> = {}
): { subject: string; plainText: string; html: string; category: string } {
  const tpl = SYSTEM_TEMPLATES[templateId.toUpperCase()];
  if (!tpl) {
    throw new Error(`Unknown system email template: ${templateId}`);
  }

  // Replace variables in plain text
  let plainText = tpl.plainTextTemplate;
  for (const [k, v] of Object.entries(variables)) {
    const regex = new RegExp(`{{${k}}}`, 'g');
    plainText = plainText.replace(regex, String(v));
  }

  // Special highlighted HTML block for OTP if present
  let specialContentHtml = '';
  if (variables.otp) {
    specialContentHtml = `
      <div style="margin: 24px 0; text-align: center;">
        <div style="display: inline-block; padding: 12px 32px; background: rgba(139, 92, 246, 0.12); border: 2px solid #8b5cf6; border-radius: 12px; font-family: monospace; font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #ffffff;">
          ${variables.otp}
        </div>
        <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">Valid for ${variables.expiry || 10} minutes. Never share this code with anyone.</p>
      </div>
    `;
  }

  const caseIdBadge = variables.case_id
    ? `<div style="margin-top: 12px; display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-family: monospace; background: rgba(255,255,255,0.06); padding: 4px 10px; border-radius: 6px; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1);">Case ID: ${variables.case_id}</div>`
    : '';

  const html = `
    <div style="background-color: #0d0f17; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; border-radius: 12px; border: 1px solid #1e293b; max-width: 600px; margin: 0 auto; line-height: 1.6;">
      <!-- Loopin Official Security Badge Header -->
      <div style="border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: ${tpl.badgeColor}; box-shadow: 0 0 10px ${tpl.badgeColor};"></div>
          <span style="font-size: 11px; font-weight: 700; letter-spacing: 1px; color: ${tpl.badgeColor}; text-transform: uppercase;">
            ${tpl.badgeLabel}
          </span>
        </div>
        <div style="font-size: 10px; color: #64748b; font-family: monospace;">
          LOOPIN INTERNAL DISPATCH ENCLAVE
        </div>
      </div>

      <!-- Main Subject / Heading -->
      <h1 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0; line-height: 1.3;">
        ${tpl.defaultSubject}
      </h1>

      <!-- Notice Container -->
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 18px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 15px; color: #f1f5f9; white-space: pre-wrap; line-height: 1.6;">
          ${plainText}
        </p>
        ${specialContentHtml}
        ${caseIdBadge}
      </div>

      <!-- Cryptographic Security Footer -->
      <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 11px; color: #64748b; line-height: 1.5;">
        <p style="margin: 0 0 6px 0;">
          <strong style="color: #94a3b8;">Cryptographic Delivery Guarantee:</strong> This message was authenticated directly via the Loopin Internal Server Bus (Mutual TLS & Zero-Knowledge Isolation).
        </p>
        <p style="margin: 0; color: #475569;">
          Sphere Mail enforces absolute privacy: Loopin administrators and Sphere social services cannot view your mailbox contents or reply threads.
        </p>
      </div>
    </div>
  `;

  return {
    subject: tpl.defaultSubject,
    plainText,
    html,
    category: tpl.category,
  };
}
