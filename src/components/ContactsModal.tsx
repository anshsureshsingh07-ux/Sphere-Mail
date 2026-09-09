import React, { useState } from 'react';
import { Users, Mail, Plus, ShieldCheck, Search, Send, UserCheck } from 'lucide-react';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComposeTo: (email: string) => void;
  configuredDomain: string;
}

export const ContactsModal: React.FC<ContactsModalProps> = ({
  isOpen,
  onClose,
  onComposeTo,
  configuredDomain,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState([
    {
      id: 'c1',
      name: 'Elena Rostova',
      email: `elena.rostova@${configuredDomain}`,
      role: 'Lead Systems Architect',
      isSphereInternal: true,
      lastActive: '10m ago',
    },
    {
      id: 'c2',
      name: 'Julian Vance',
      email: `julian.vance@${configuredDomain}`,
      role: 'Security Enclave Engineer',
      isSphereInternal: true,
      lastActive: '2h ago',
    },
    {
      id: 'c3',
      name: 'Loopin Security Operations',
      email: `security-ops@${configuredDomain}`,
      role: 'Platform Enclave Dispatch',
      isSphereInternal: true,
      lastActive: 'Online',
    },
    {
      id: 'c4',
      name: 'Marcus Brody',
      email: 'compliance@veritas-security.net',
      role: 'External Auditor',
      isSphereInternal: false,
      lastActive: 'Yesterday',
    },
  ]);

  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactEmail) return;

    setContacts((prev) => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        name: newContactName,
        email: newContactEmail,
        role: 'Peer Contact',
        isSphereInternal: newContactEmail.toLowerCase().endsWith(`@${configuredDomain.toLowerCase()}`),
        lastActive: 'Just added',
      },
    ]);
    setNewContactName('');
    setNewContactEmail('');
    setShowAddForm(false);
  };

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#10121d] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-[#0d0f17] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-violet-400" />
            <div>
              <h3 className="text-base font-bold text-white">Contacts & Directory</h3>
              <p className="text-xs text-slate-400">Encrypted personal directory stored on your personal digital server</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-violet-500"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col gap-2.5 text-xs">
            <span className="font-bold text-white">Add New Contact</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Full Name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 outline-none"
              />
              <input
                type="email"
                placeholder={`Email (e.g. name@${configuredDomain})`}
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Contacts List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-800/60">
          {filtered.map((c) => (
            <div key={c.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-950/80 border border-violet-800/40 flex items-center justify-center font-bold text-xs text-violet-300">
                  {(c.name || c.email || 'C').slice(0, 1).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{c.name}</span>
                    {c.isSphereInternal && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-950 text-violet-400 border border-violet-800/40 font-semibold">
                        Sphere Peer
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{c.email}</span>
                  <span className="text-[10px] text-slate-500">{c.role}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onComposeTo(c.email);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-violet-600 hover:text-white text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Message</span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0d0f17] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
