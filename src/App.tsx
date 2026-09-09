import React, { useState, useEffect, useCallback } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
import { TopBar } from './components/TopBar';
import { InboxView } from './components/InboxView';
import { EmailDetailView } from './components/EmailDetailView';
import { ComposeModal } from './components/ComposeModal';
import { PersonalDigitalServerModal } from './components/PersonalDigitalServerModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { SphereOfficialDispatchModal } from './components/SphereOfficialDispatchModal';
import { ContactsModal } from './components/ContactsModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { AuthModal } from './components/AuthModal';
import { LoopinInternalApiModal } from './components/LoopinInternalApiModal';
import { api } from './services/api';
import { Email, UserAccount, MailSystemConfig, PersonalDigitalServer } from './types';
import { SPHERE_CONFIG } from './config/sphereConfig';

export default function App() {
  // State
  const [user, setUser] = useState<UserAccount | null>(null);
  const [config, setConfig] = useState<MailSystemConfig | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('inbox');
  const [activeTag, setActiveTag] = useState<string>('all');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [filterOfficialOnly, setFilterOfficialOnly] = useState<boolean>(false);

  // Modals state
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [composeInitialDraft, setComposeInitialDraft] = useState<{
    to?: string;
    subject?: string;
    body?: string;
  } | undefined>(undefined);

  const [isStorageOpen, setIsStorageOpen] = useState<boolean>(false);
  const [personalServer, setPersonalServer] = useState<PersonalDigitalServer | null>(null);
  const [isServerLoading, setIsServerLoading] = useState<boolean>(false);

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState<boolean>(false);
  const [isInternalApiOpen, setIsInternalApiOpen] = useState<boolean>(false);
  const [isContactsOpen, setIsContactsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Load config & initial user with permanent session persistence
  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Fetch system config
        const sysConfig = await api.getConfig();
        setConfig(sysConfig);

        // 2. Check cached user from previous session immediately for instant render
        const cachedUser = api.getStoredUser();
        const storedToken = api.getStoredToken();

        if (cachedUser) {
          setUser(cachedUser);
        }

        // 3. Verify and hydrate session with backend
        let activeUser: UserAccount | null = null;
        if (storedToken) {
          try {
            const sessionRes = await api.getCurrentUser();
            if (sessionRes && sessionRes.user) {
              activeUser = sessionRes.user;
              setUser(activeUser);
              api.setStoredUser(activeUser);
            }
          } catch (sessionErr) {
            console.warn('Stored session verification notice:', sessionErr);
            // If cachedUser exists, maintain it rather than logging out abruptly
            if (cachedUser) {
              activeUser = cachedUser;
            }
          }
        }

        // 4. If no stored session exists at all (first-time visitor), initialize default sovereign mailbox
        if (!activeUser && !storedToken && !cachedUser) {
          try {
            const demo = await api.login('yourname@yourchoice.com', 'SphereSecured2026!');
            setUser(demo.user);
          } catch {
            const demo = await api.login(`alex.mercer@${sysConfig.domain}`, 'SphereSecured2026!');
            setUser(demo.user);
          }
        }
      } catch (err) {
        console.error('Initial bootstrap error:', err);
      }
    };
    initApp();
  }, []);

  // Fetch emails
  const loadEmails = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getEmails({
        folder: currentFolder,
        tag: activeTag !== 'all' ? activeTag : undefined,
        search: searchQuery || undefined,
      });

      let list = data.emails;
      if (filterOfficialOnly) {
        list = list.filter((e) => e.security?.isLoopinOfficial);
      }

      setEmails(list);
    } catch (err) {
      console.error('Failed to load emails:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolder, activeTag, searchQuery, filterOfficialOnly]);

  useEffect(() => {
    loadEmails();
  }, [loadEmails, user?.userId]);

  // Fetch personal digital server when storage modal is opened
  const loadPersonalServer = useCallback(async () => {
    setIsServerLoading(true);
    try {
      const srv = await api.getPersonalServer();
      setPersonalServer(srv);
    } catch (err) {
      console.error('Failed to load personal server:', err);
    } finally {
      setIsServerLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isStorageOpen) {
      loadPersonalServer();
    }
  }, [isStorageOpen, loadPersonalServer]);

  // Unread counts calculation
  const [unreadCounts, setUnreadCounts] = useState({ inbox: 3, starred: 0, spam: 1 });
  useEffect(() => {
    api.getEmails({ folder: 'inbox' }).then((res) => {
      const unreadInbox = res.emails.filter((e) => !e.isRead).length;
      const unreadStarred = res.emails.filter((e) => e.isStarred).length;
      setUnreadCounts((prev) => ({ ...prev, inbox: unreadInbox, starred: unreadStarred }));
    });
  }, [emails]);

  // Handlers
  const handleSelectEmail = async (id: string) => {
    setSelectedEmailId(id);
    // Mark as read in backend
    try {
      await api.markAsRead([id], true);
      setEmails((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isRead: true } : e))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStar = async (id: string, currentStarred: boolean) => {
    const nextStarred = !currentStarred;
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isStarred: nextStarred } : e))
    );
    try {
      await api.starEmail(id, nextStarred);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAction = async (ids: string[], action: any, targetFolder?: string) => {
    try {
      if (action === 'mark_read') {
        await api.markAsRead(ids, true);
        setEmails((prev) =>
          prev.map((e) => (ids.includes(e.id) ? { ...e, isRead: true } : e))
        );
      } else if (action === 'mark_unread') {
        await api.markAsRead(ids, false);
        setEmails((prev) =>
          prev.map((e) => (ids.includes(e.id) ? { ...e, isRead: false } : e))
        );
      } else if (action === 'star') {
        for (const id of ids) await api.starEmail(id, true);
        setEmails((prev) =>
          prev.map((e) => (ids.includes(e.id) ? { ...e, isStarred: true } : e))
        );
      } else if (action === 'unstar') {
        for (const id of ids) await api.starEmail(id, false);
        setEmails((prev) =>
          prev.map((e) => (ids.includes(e.id) ? { ...e, isStarred: false } : e))
        );
      } else if (action === 'archive') {
        await api.moveEmails(ids, 'archive');
        loadEmails();
      } else if (action === 'delete') {
        await api.moveEmails(ids, 'trash');
        loadEmails();
      } else if (action === 'spam') {
        await api.moveEmails(ids, 'spam');
        loadEmails();
      } else if (action === 'move' && targetFolder) {
        await api.moveEmails(ids, targetFolder);
        loadEmails();
      }
    } catch (err) {
      console.error('Bulk action failed:', err);
    }
  };

  const handleSendEmail = async (payload: any) => {
    await api.sendEmail(payload);
    // Reload emails if in sent or current view
    loadEmails();
    // Also trigger refresh of server stats
    if (personalServer) loadPersonalServer();
  };

  const handleReply = (email: Email, mode: 'reply' | 'replyAll' | 'forward') => {
    let to = email.sender.address;
    let subject = email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`;
    let body = `\n\n--- On ${new Date(email.timestamp).toLocaleString()}, ${email.sender.name} wrote:\n> ${email.bodyPlain}`;

    if (mode === 'forward') {
      to = '';
      subject = email.subject.startsWith('Fwd:') ? email.subject : `Fwd: ${email.subject}`;
      body = `\n\n---------- Forwarded message ---------\nFrom: ${email.sender.name} <${email.sender.address}>\nDate: ${email.timestamp}\nSubject: ${email.subject}\n\n${email.bodyPlain}`;
    }

    setComposeInitialDraft({ to, subject, body });
    setIsComposeOpen(true);
  };

  const handleSaveAttachmentToServer = async (name: string, size: number) => {
    try {
      await api.uploadPersonalServerFile({
        name,
        size,
        category: 'mail_attachment',
        type: 'file',
      });
      loadPersonalServer();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendQuickReply = async (replyText: string) => {
    const currentEmail = emails.find((e) => e.id === selectedEmailId);
    if (!currentEmail) return;

    await api.sendEmail({
      recipients: [
        {
          name: currentEmail.sender.name,
          address: currentEmail.sender.address,
          isSphereInternal: currentEmail.sender.isSphereInternal,
        },
      ],
      subject: currentEmail.subject.startsWith('Re:') ? currentEmail.subject : `Re: ${currentEmail.subject}`,
      bodyPlain: replyText,
      bodyHtml: `<p>${replyText}</p>`,
      attachments: [],
    });
    loadEmails();
  };

  const handleUploadPersonalServerFile = async (fileData: any) => {
    await api.uploadPersonalServerFile(fileData);
    loadPersonalServer();
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (session: { token: string; user: any }) => {
    if (session.token) {
      api.setStoredToken(session.token);
    }
    if (session.user) {
      api.setStoredUser(session.user);
      setUser(session.user);
    }
    loadEmails();
    loadPersonalServer();
  };

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || null;

  return (
    <div
      id="sphere-mail-app"
      className={`min-h-screen flex flex-col antialiased text-slate-100 ${
        theme === 'dark' ? 'bg-[#07090e]' : 'bg-slate-900 text-slate-100'
      }`}
    >
      {/* Top Application Bar */}
      <TopBar
        user={user}
        config={config}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStorage={() => setIsStorageOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenInternalApi={() => setIsInternalApiOpen(true)}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onQuickFilter={(f) => {
          if (f.officialOnly !== undefined) {
            setFilterOfficialOnly(f.officialOnly);
          }
        }}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Sidebar */}
        <LeftSidebar
          currentFolder={currentFolder}
          onSelectFolder={(folder) => {
            setCurrentFolder(folder);
            setSelectedEmailId(null);
          }}
          onOpenCompose={() => {
            setComposeInitialDraft(undefined);
            setIsComposeOpen(true);
          }}
          onOpenStorage={() => setIsStorageOpen(true)}
          onOpenContacts={() => setIsContactsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenDispatch={() => setIsDispatchOpen(true)}
          onOpenInternalApi={() => setIsInternalApiOpen(true)}
          unreadCounts={unreadCounts}
          activeTag={activeTag}
          onSelectTag={(tag) => {
            setActiveTag(tag);
            setSelectedEmailId(null);
          }}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Center Stage: Email List or Email Detail */}
        <main className="flex-1 flex overflow-hidden relative">
          {selectedEmail ? (
            <EmailDetailView
              email={selectedEmail}
              onBack={() => setSelectedEmailId(null)}
              onReply={handleReply}
              onArchive={async (id) => {
                await handleBulkAction([id], 'archive');
                setSelectedEmailId(null);
              }}
              onDelete={async (id) => {
                await handleBulkAction([id], 'delete');
                setSelectedEmailId(null);
              }}
              onReportSpam={async (id) => {
                await handleBulkAction([id], 'spam');
                setSelectedEmailId(null);
              }}
              onToggleStar={handleToggleStar}
              onSaveAttachmentToServer={handleSaveAttachmentToServer}
              onSendQuickReply={handleSendQuickReply}
            />
          ) : (
            <InboxView
              emails={emails}
              selectedEmailId={selectedEmailId}
              onSelectEmail={handleSelectEmail}
              folderTitle={
                activeTag !== 'all'
                  ? `Tag: #${activeTag}`
                  : currentFolder
              }
              onToggleStar={handleToggleStar}
              onBulkAction={handleBulkAction}
              onRefresh={loadEmails}
              isLoading={isLoading}
              filterOfficialOnly={filterOfficialOnly}
              onToggleFilterOfficial={() => setFilterOfficialOnly(!filterOfficialOnly)}
            />
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}

      {/* 1. Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendEmail}
        configuredDomain={config?.domain || SPHERE_CONFIG.domain}
        initialDraft={composeInitialDraft}
      />

      {/* 2. Personal Digital Server & Storage Modal */}
      <PersonalDigitalServerModal
        isOpen={isStorageOpen}
        onClose={() => setIsStorageOpen(false)}
        server={personalServer}
        onUploadFile={handleUploadPersonalServerFile}
        isLoading={isServerLoading}
      />

      {/* 3. Founder & Admin Enclave Modal */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* 4. Sphere Official Platform Dispatch Modal */}
      <SphereOfficialDispatchModal
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        userEmail={user?.sphereEmail || `alex.mercer@${config?.domain || 'spheremail.net'}`}
        onNoticeDispatched={() => {
          loadEmails();
          if (personalServer) loadPersonalServer();
        }}
      />

      {/* 5. Contacts Modal */}
      <ContactsModal
        isOpen={isContactsOpen}
        onClose={() => setIsContactsOpen(false)}
        onComposeTo={(email) => {
          setComposeInitialDraft({ to: email });
          setIsComposeOpen(true);
        }}
        configuredDomain={config?.domain || SPHERE_CONFIG.domain}
      />

      {/* 6. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        config={config}
      />

      {/* 7. Help & Architecture Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        configuredDomain={config?.domain || SPHERE_CONFIG.domain}
      />

      {/* 8. Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        configuredDomain={config?.domain || SPHERE_CONFIG.domain}
      />

      {/* 9. Loopin Private Internal API & Zero-Knowledge Architecture Enclave */}
      <LoopinInternalApiModal
        isOpen={isInternalApiOpen}
        onClose={() => setIsInternalApiOpen(false)}
        currentUser={user}
        onEmailDispatched={() => {
          loadEmails();
          if (personalServer) loadPersonalServer();
        }}
      />
    </div>
  );
}
