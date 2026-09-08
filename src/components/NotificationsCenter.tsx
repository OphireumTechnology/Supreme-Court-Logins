import React, { useState } from 'react';
import { NotificationItem, LegalCase } from '../types';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Send, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

interface NotificationsCenterProps {
  notifications: NotificationItem[];
  cases: LegalCase[];
  onSendAutomatedAlert: (alert: Omit<NotificationItem, 'id' | 'sentAt' | 'status'>) => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  notifications,
  cases,
  onSendAutomatedAlert
}) => {
  const [selectedGr, setSelectedGr] = useState(cases[0]?.grNumber || '');
  const [channel, setChannel] = useState<'EMAIL' | 'SMS' | 'DUAL'>('DUAL');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('URGENT');
  const [notifType, setNotifType] = useState<'COURT_REMINDER' | 'STATUS_UPDATE' | 'SECURITY_ALERT' | 'KEY_ISSUANCE'>('COURT_REMINDER');
  const [subject, setSubject] = useState('Supreme Court En Banc Hearing Notice');
  const [message, setMessage] = useState('Your oral argument for G.R. No. 241014-SC has been calendared for next Tuesday at 09:30 AM in the Supreme Court En Banc Session Hall.');
  const [recipientEmail, setRecipientEmail] = useState('antonio.valdez@ph-enterprise.com');
  const [recipientPhone, setRecipientPhone] = useState('+63 918 123 4567');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    setTimeout(() => {
      onSendAutomatedAlert({
        recipientEmail,
        recipientPhone,
        type: notifType,
        channel,
        subject,
        message,
        grNumber: selectedGr,
        priority
      });

      setIsSending(false);
      setFeedback(`Automated notification dispatched via ${channel} to ${recipientEmail} / ${recipientPhone}!`);
      setTimeout(() => setFeedback(null), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
            <Bell className="w-4 h-4" />
            <span>JUDICIAL AUTOMATED NOTIFICATIONS GATEWAY</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 font-serif">
            Court Date Reminders &amp; Status Update Notifications
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Automated multi-channel broadcast service delivering real-time SMS and encrypted email notices for court hearing dates, status transitions, TRO issuances, and security alerts.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid: Dispatch Form & Delivery Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispatch Form */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-100 font-serif flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-400" />
            <span>Broadcast Judicial Reminder</span>
          </h3>

          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target G.R. Filing:</label>
              <select
                value={selectedGr}
                onChange={(e) => setSelectedGr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.grNumber}>
                    {c.grNumber} - {c.title.slice(0, 35)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Notice Type:</label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="COURT_REMINDER">Court Hearing Reminder</option>
                  <option value="STATUS_UPDATE">Status Transition</option>
                  <option value="KEY_ISSUANCE">Key Decision Issued</option>
                  <option value="SECURITY_ALERT">Security Alert</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Dispatch Channel:</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="DUAL">SMS &amp; Email (Dual)</option>
                  <option value="EMAIL">Email Only</option>
                  <option value="SMS">SMS Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Recipient Email:</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Recipient Phone:</label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Subject Line:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Notice Body:</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              {isSending ? (
                <span>Dispatching Notice...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Automated Court Notification</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Notification Delivery Stream */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Delivered Notification Log ({notifications.length})</span>
            <span className="font-mono text-emerald-400">SMS / Email Carrier Gateway Active</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[520px]">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                      {n.grNumber || 'General'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-200">
                      {n.subject}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-[10px] text-slate-500">{n.sentAt}</span>
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                      {n.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {n.message}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-cyan-400">
                      {n.channel === 'SMS' ? <Smartphone className="w-3 h-3" /> : n.channel === 'EMAIL' ? <Mail className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                      <span>Channel: {n.channel}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="truncate max-w-[200px]">To: {n.recipientEmail}</span>
                  </div>

                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                    n.priority === 'URGENT' ? 'text-rose-400 bg-rose-950/40' : 'text-slate-400 bg-slate-800'
                  }`}>
                    Priority: {n.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
