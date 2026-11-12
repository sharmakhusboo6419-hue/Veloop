import React, { useState, useEffect } from 'react';
import { Mail, Send, Inbox, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

export const GmailIntegration: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('google_access_token'));
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('VELoop Rewards: Congratulations on your level advance!');
  const [emailBody, setEmailBody] = useState('You have successfully earned new VE rewards and leveled up in VELoop Rewards!');
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleAuthClick = () => {
    if (!window.google?.accounts?.oauth2) {
      alert('Google Identity Services script not loaded yet.');
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: 'gen-lang-client-0334898371.apps.googleusercontent.com', // or handled by environment
      scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
      callback: (response: any) => {
        if (response.access_token) {
          setAccessToken(response.access_token);
          localStorage.setItem('google_access_token', response.access_token);
          fetchGmailMessages(response.access_token);
        }
      },
    });
    client.requestAccessToken();
  };

  const fetchGmailMessages = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.messages) {
        // Fetch details for each message
        const detailedMessages = await Promise.all(
          data.messages.map(async (msg: any) => {
            const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            return detailRes.json();
          })
        );
        setMessages(detailedMessages);
      }
    } catch (err) {
      console.error('Error fetching Gmail messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchGmailMessages(accessToken);
    }
  }, [accessToken]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSending(true);
    setStatusMsg(null);

    try {
      const rawMessage = [
        `To: ${emailTo}`,
        `Subject: ${emailSubject}`,
        'Content-Type: text/plain; charset="UTF-8"',
        '',
        emailBody
      ].join('\r\n');

      const encodedMessage = btoa(rawMessage).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedMessage })
      });

      if (res.ok) {
        setStatusMsg('Email sent successfully via Gmail API!');
        setEmailBody('');
      } else {
        const errData = await res.json();
        setStatusMsg(`Failed to send email: ${errData.error?.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[var(--card)] border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Mail className="w-5 h-5 text-red-400" /> Gmail Notification & Mailbox Integration
        </h2>
        {!accessToken ? (
          <button
            onClick={handleAuthClick}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            Connect Gmail Account
          </button>
        ) : (
          <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Gmail Connected
          </span>
        )}
      </div>

      {accessToken ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send Reward Email */}
          <div className="bg-[#0F172A]/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-400" /> Send Reward Notification Email
            </h3>

            {statusMsg && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs rounded-xl">
                {statusMsg}
              </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Recipient Email</label>
                <input
                  type="email"
                  required
                  value={emailTo}
                  onChange={e => setEmailTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full bg-[var(--card)] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="w-full bg-[var(--card)] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Body</label>
                <textarea
                  required
                  rows={3}
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  className="w-full bg-[var(--card)] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
              >
                {sending ? 'Sending...' : 'Send Email via Gmail'} <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Recent Mailbox Messages */}
          <div className="bg-[#0F172A]/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Inbox className="w-4 h-4 text-amber-400" /> Recent Mailbox Messages
              </h3>
              <button
                onClick={() => fetchGmailMessages(accessToken)}
                className="text-slate-400 hover:text-white"
                title="Refresh messages"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-6 text-slate-400 text-xs">Loading emails...</div>
              ) : messages.length > 0 ? (
                messages.map((m: any) => {
                  const headers = m.payload?.headers || [];
                  const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
                  const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
                  return (
                    <div key={m.id} className="bg-[var(--card)] border border-slate-800 rounded-xl p-3 text-xs">
                      <span className="font-semibold text-white block truncate">{subject}</span>
                      <span className="text-slate-400 text-[11px] block truncate">From: {from}</span>
                      <span className="text-slate-500 text-[10px] font-mono mt-1 block">Snippet: {m.snippet}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">No messages found in mailbox.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-[#0F172A]/40 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400 mb-3">Connect your Google account to enable Gmail notifications and mailbox management inside VELoop Rewards.</p>
          <button
            onClick={handleAuthClick}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            Authenticate with Google Gmail
          </button>
        </div>
      )}
    </div>
  );
};
