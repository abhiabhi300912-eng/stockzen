import React, { useState, useEffect } from 'react';
import {
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  setCachedAccessToken,
} from '../services/auth';
import {
  fetchGmailProfile,
  fetchGmailMessages,
  fetchMessageContent,
  sendGmailMessage,
  GmailMessageSummary,
  GmailProfile,
} from '../services/gmail';
import { StockInfo } from '../types';
import { formatRupees } from '../utils/currency';

interface GmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStock?: StockInfo;
}

export const GmailModal: React.FC<GmailModalProps> = ({ isOpen, onClose, currentStock }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');

  // Selected email to view full content
  const [selectedMessage, setSelectedMessage] = useState<{
    id: string;
    subject: string;
    from: string;
    date: string;
    body: string;
  } | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Compose State
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  // Mandatory User Confirmation Dialog State for destructive/outgoing actions
  const [pendingConfirmSend, setPendingConfirmSend] = useState<boolean>(false);

  // Check cached token on open
  useEffect(() => {
    if (isOpen) {
      getAccessToken().then((t) => {
        if (t) {
          setToken(t);
          loadProfileAndMessages(t);
        }
      });
    }
  }, [isOpen]);

  const loadProfileAndMessages = async (accessToken: string, query = '') => {
    setIsLoadingMessages(true);
    setAuthError(null);
    try {
      const [prof, msgs] = await Promise.all([
        fetchGmailProfile(accessToken),
        fetchGmailMessages(accessToken, { query, maxResults: 12 }),
      ]);
      setProfile(prof);
      setMessages(msgs);
    } catch (err: any) {
      console.error('Gmail error:', err);
      setAuthError(err.message || 'Failed to load Gmail messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setToken(res.accessToken);
        setCachedAccessToken(res.accessToken);
        await loadProfileAndMessages(res.accessToken);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setToken(null);
    setProfile(null);
    setMessages([]);
    setSelectedMessage(null);
  };

  const handleOpenMessage = async (msgId: string) => {
    if (!token) return;
    setIsLoadingContent(true);
    try {
      const full = await fetchMessageContent(token, msgId);
      setSelectedMessage(full);
    } catch (err: any) {
      alert(`Could not load email content: ${err.message}`);
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Pre-fill templates
  const handleApplyTemplate = (type: 'telemetry' | 'signal' | 'custom') => {
    if (!currentStock) return;
    if (type === 'telemetry') {
      setSubject(`StockZen Alert: ${currentStock.ticker} Market Telemetry & Sentiment`);
      setMessageBody(`
        <h2>StockZen Intelligence Report</h2>
        <p><strong>Ticker:</strong> ${currentStock.ticker} (${currentStock.name}) - ${currentStock.exchange}</p>
        <p><strong>Current Price:</strong> ${formatRupees(currentStock.price)} (${currentStock.changePercent > 0 ? '+' : ''}${currentStock.changePercent.toFixed(2)}%)</p>
        <p><strong>FinBERT Sentiment:</strong> ${currentStock.sentimentLabel} (Composite Score: ${(currentStock.sentimentComposite * 100).toFixed(0)}%)</p>
        <p><strong>Technical Direction:</strong> ${currentStock.direction} (Confidence: ${currentStock.consensusConfidence}%)</p>
        <p><strong>Day Range:</strong> ${formatRupees(currentStock.dayLow)} - ${formatRupees(currentStock.dayHigh)}</p>
        <hr/>
        <p><small>Sent via StockZen AI Terminal with Google Workspace Gmail integration.</small></p>
      `);
    } else if (type === 'signal') {
      setSubject(`StockZen Prediction Forecast: ${currentStock.ticker}`);
      setMessageBody(`
        <h2>StockZen Neural Ensemble Forecast</h2>
        <p><strong>Target Equities:</strong> ${currentStock.ticker}</p>
        <p><strong>Ensemble Direction:</strong> ${currentStock.direction}</p>
        <p><strong>Consensus Confidence:</strong> ${currentStock.consensusConfidence}%</p>
        <p><strong>Projected Target Range:</strong> ${formatRupees(currentStock.targetRange[0])} to ${formatRupees(currentStock.targetRange[1])}</p>
        <p><strong>Median Target:</strong> ${formatRupees(currentStock.medianTarget)}</p>
        <hr/>
        <p><small>Generated by StockZen Multi-Factor LSTM & Random Forest Classifier.</small></p>
      `);
    }
  };

  // Trigger Confirmation modal before actual sending
  const handleInitiateSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toEmail.trim() || !subject.trim() || !messageBody.trim()) {
      alert('Please fill in recipient email, subject, and message body.');
      return;
    }
    setPendingConfirmSend(true);
  };

  // Execute after explicit confirmation
  const handleConfirmAndSend = async () => {
    if (!token) return;
    setPendingConfirmSend(false);
    setIsSending(true);
    setSendSuccess(null);
    setAuthError(null);

    try {
      await sendGmailMessage(token, toEmail.trim(), subject.trim(), messageBody);
      setSendSuccess(`Email successfully sent to ${toEmail.trim()} via Gmail!`);
      setToEmail('');
      setSubject('');
      setMessageBody('');
      // Reload inbox after short delay
      setTimeout(() => {
        loadProfileAndMessages(token);
      }, 1000);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send email via Gmail API.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0e18]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#1c1f2a] rounded-2xl shadow-2xl border border-[#262a35] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 border-b border-[#262a35] flex items-center justify-between bg-[#171b26]">
          <div className="flex items-center gap-3">
            {/* Gmail Icon */}
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-2 border border-white/15">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4.9 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-[17px] text-[#dfe2f1] font-bold">
                  Gmail Workspace Hub
                </h2>
                <span className="px-1.5 py-0.2 rounded bg-[#ea4335]/20 text-[#ff8e85] font-data-mono-sm text-[9px] font-bold border border-[#ea4335]/30">
                  WORKSPACE
                </span>
              </div>
              <p className="text-[11px] font-data-mono-sm text-[#bdc8d1]">
                {profile
                  ? `Connected: ${profile.emailAddress} (${profile.messagesTotal.toLocaleString()} emails)`
                  : 'Send market reports, stock alerts & read trading emails'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token && (
              <button
                onClick={handleSignOut}
                className="px-2.5 py-1 rounded-lg bg-[#262a35] hover:bg-[#313540] text-[#ffb4ab] text-[11px] font-data-mono-sm transition-colors border border-[#313540]"
                title="Disconnect Gmail"
              >
                Disconnect
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-[#bdc8d1] hover:text-[#dfe2f1] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* If NOT authenticated -> Official Google Sign-In Card */}
          {!token ? (
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-4 bg-[#171b26] rounded-xl border border-[#262a35]">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-3 shadow-inner">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4.9 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                    fill="#EA4335"
                  />
                </svg>
              </div>

              <div className="max-w-md space-y-1.5">
                <h3 className="font-headline-sm text-[18px] text-[#dfe2f1] font-bold">
                  Connect Your Gmail Account
                </h3>
                <p className="font-body-sm text-[12px] text-[#bdc8d1] leading-relaxed">
                  Sign in with Google to read trading notifications, send instant quantitative research
                  reports in Rupees, and deliver price target alerts directly to your inbox.
                </p>
              </div>

              {authError && (
                <div className="p-2.5 rounded-lg bg-[#93000a]/20 border border-[#ffb4ab]/40 text-[#ffb4ab] text-[11px] font-data-mono-sm max-w-md">
                  {authError}
                </div>
              )}

              {/* Official Google Sign-In Button style */}
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white text-[#1f1f1f] font-sans text-[14px] font-medium shadow-md hover:bg-[#f1f3f4] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
              </button>

              <div className="pt-2 text-[10px] font-data-mono-sm text-[#87929a]">
                Workspace Scopes: Read, Send, Compose, Metadata, Labels
              </div>
            </div>
          ) : (
            /* Authenticated View: Tabs for Inbox and Compose */
            <div className="space-y-3.5">
              {/* Tab Navigation */}
              <div className="flex p-1 bg-[#171b26] rounded-xl gap-1 border border-[#262a35]">
                <button
                  onClick={() => {
                    setActiveTab('inbox');
                    setSelectedMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-center font-data-mono-sm text-[12px] rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'inbox'
                      ? 'bg-[#38bdf8] text-[#001e2c] font-bold shadow-sm'
                      : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">inbox</span>
                  <span>Inbox ({messages.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('compose')}
                  className={`flex-1 py-1.5 text-center font-data-mono-sm text-[12px] rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'compose'
                      ? 'bg-[#38bdf8] text-[#001e2c] font-bold shadow-sm'
                      : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Compose & Send Stock Alert</span>
                </button>
              </div>

              {sendSuccess && (
                <div className="p-2.5 rounded-lg bg-[#30c88f]/20 border border-[#56e5a9]/50 text-[#56e5a9] font-data-mono-sm text-[11px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>{sendSuccess}</span>
                </div>
              )}

              {authError && (
                <div className="p-2.5 rounded-lg bg-[#93000a]/20 border border-[#ffb4ab]/40 text-[#ffb4ab] text-[11px] font-data-mono-sm">
                  {authError}
                </div>
              )}

              {/* TAB 1: INBOX */}
              {activeTab === 'inbox' && (
                <div className="space-y-3">
                  {/* Search Bar & Refresh */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined text-[16px] text-[#87929a] absolute left-2.5 top-1/2 -translate-y-1/2">
                        search
                      </span>
                      <input
                        type="text"
                        placeholder="Search emails (e.g., NVDA, alerts, market)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && token) {
                            loadProfileAndMessages(token, searchQuery);
                          }
                        }}
                        className="w-full bg-[#171b26] text-[#dfe2f1] font-data-mono-sm text-[12px] pl-8 pr-3 py-1.5 rounded-lg border border-[#262a35] focus:outline-none focus:border-[#38bdf8]"
                      />
                    </div>
                    <button
                      onClick={() => token && loadProfileAndMessages(token, searchQuery)}
                      disabled={isLoadingMessages}
                      className="px-3 py-1.5 rounded-lg bg-[#262a35] hover:bg-[#313540] text-[#dfe2f1] font-data-mono-sm text-[11px] flex items-center gap-1 border border-[#313540]"
                    >
                      <span
                        className={`material-symbols-outlined text-[15px] ${
                          isLoadingMessages ? 'animate-spin' : ''
                        }`}
                      >
                        refresh
                      </span>
                      <span>Refresh</span>
                    </button>
                  </div>

                  {/* Message Detail Viewer Modal or List */}
                  {selectedMessage ? (
                    <div className="bg-[#171b26] p-4 rounded-xl border border-[#262a35] space-y-3 animate-fadeIn">
                      <div className="flex justify-between items-start border-b border-[#262a35] pb-2.5">
                        <div className="space-y-1">
                          <h4 className="font-headline-sm text-[15px] text-[#dfe2f1] font-bold">
                            {selectedMessage.subject}
                          </h4>
                          <div className="text-[11px] font-data-mono-sm text-[#bdc8d1] flex items-center gap-2">
                            <span>From: {selectedMessage.from}</span>
                            <span>•</span>
                            <span className="text-[#87929a]">{selectedMessage.date}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedMessage(null)}
                          className="px-2.5 py-1 rounded bg-[#262a35] hover:bg-[#313540] text-[#bdc8d1] text-[11px] font-data-mono-sm"
                        >
                          Back to Inbox
                        </button>
                      </div>

                      <div
                        className="text-[12px] text-[#dfe2f1] bg-[#1c1f2a] p-3 rounded-lg border border-[#262a35]/60 overflow-x-auto max-h-72 overflow-y-auto leading-relaxed prose prose-invert prose-sm"
                        dangerouslySetInnerHTML={{ __html: selectedMessage.body }}
                      />
                    </div>
                  ) : (
                    /* Messages List */
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {isLoadingMessages ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#bdc8d1]">
                          <span className="material-symbols-outlined animate-spin text-[24px] text-[#38bdf8]">
                            progress_activity
                          </span>
                          <span className="font-data-mono-sm text-[12px]">
                            Loading Gmail messages...
                          </span>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="py-10 text-center text-[#87929a] font-data-mono-sm text-[12px] bg-[#171b26] rounded-xl border border-[#262a35]">
                          No messages found. Try a different search term or check back later.
                        </div>
                      ) : (
                        messages.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => handleOpenMessage(m.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer hover:border-[#38bdf8]/50 active:scale-[0.99] ${
                              m.isUnread
                                ? 'bg-[#171b26] border-[#38bdf8]/30 shadow-sm'
                                : 'bg-[#1c1f2a] border-[#262a35]'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-data-mono-sm">
                              <span
                                className={`font-semibold truncate max-w-[200px] ${
                                  m.isUnread ? 'text-[#8ed5ff]' : 'text-[#bdc8d1]'
                                }`}
                              >
                                {m.from}
                              </span>
                              <span className="text-[#87929a] text-[10px] shrink-0">{m.date}</span>
                            </div>
                            <h4
                              className={`text-[13px] font-medium mt-1 truncate ${
                                m.isUnread ? 'text-white font-bold' : 'text-[#dfe2f1]'
                              }`}
                            >
                              {m.subject}
                            </h4>
                            <p className="text-[11px] text-[#87929a] truncate mt-0.5 font-body-sm">
                              {m.snippet}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: COMPOSE & SEND STOCK ALERT */}
              {activeTab === 'compose' && (
                <form onSubmit={handleInitiateSend} className="space-y-3 bg-[#171b26] p-4 rounded-xl border border-[#262a35]">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-[11px] text-[#bdc8d1] uppercase font-bold">
                      COMPOSE TRADING ALERT VIA GMAIL
                    </span>
                    {/* Quick Template Chips */}
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplyTemplate('telemetry')}
                        className="px-2 py-0.5 rounded bg-[#262a35] hover:bg-[#313540] text-[#38bdf8] text-[10px] font-data-mono-sm border border-[#313540]"
                      >
                        + Telemetry Report
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyTemplate('signal')}
                        className="px-2 py-0.5 rounded bg-[#262a35] hover:bg-[#313540] text-[#56e5a9] text-[10px] font-data-mono-sm border border-[#313540]"
                      >
                        + AI Forecast
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#bdc8d1] font-label-caps text-[10px] mb-1">
                      Recipient Email (To):
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="analyst@firm.com or your email"
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      className="w-full bg-[#1c1f2a] border border-[#262a35] rounded-lg px-3 py-1.5 text-[12px] text-[#dfe2f1] focus:outline-none focus:border-[#38bdf8] font-data-mono-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[#bdc8d1] font-label-caps text-[10px] mb-1">
                      Email Subject:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="StockZen Alert: AAPL Bullish Momentum..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[#1c1f2a] border border-[#262a35] rounded-lg px-3 py-1.5 text-[12px] text-[#dfe2f1] focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#bdc8d1] font-label-caps text-[10px] mb-1">
                      Email Body (Supports HTML formatting):
                    </label>
                    <textarea
                      rows={6}
                      required
                      placeholder="Write your market note, report, or click a template above..."
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      className="w-full bg-[#1c1f2a] border border-[#262a35] rounded-lg px-3 py-2 text-[12px] text-[#dfe2f1] focus:outline-none focus:border-[#38bdf8] font-data-mono-sm leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-2.5 rounded-xl bg-[#ea4335] hover:bg-[#f35345] text-white font-headline-sm text-[14px] font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>{isSending ? 'Sending via Gmail...' : 'Send Email via Gmail'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#262a35] flex justify-between items-center bg-[#171b26]">
          <span className="text-[11px] font-data-mono-sm text-[#87929a]">
            Gmail API • OAuth 2.0 Token Authenticated
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#262a35] hover:bg-[#313540] text-[#dfe2f1] text-[12px] font-bold rounded-lg transition-colors border border-[#313540]"
          >
            Close
          </button>
        </div>
      </div>

      {/* MANDATORY USER CONFIRMATION DIALOG FOR SENDING EMAILS */}
      {pendingConfirmSend && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1c1f2a] border border-[#ea4335]/60 rounded-2xl p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ea4335]/20 flex items-center justify-center text-[#ea4335]">
                <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-[16px] text-white font-bold">
                  Confirm Sending Email
                </h3>
                <span className="text-[11px] font-data-mono-sm text-[#ff8e85]">
                  Gmail API Action
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#171b26] border border-[#262a35] space-y-1.5 font-data-mono-sm text-[11px]">
              <div>
                <span className="text-[#87929a]">To: </span>
                <span className="text-[#dfe2f1] font-bold">{toEmail}</span>
              </div>
              <div>
                <span className="text-[#87929a]">Subject: </span>
                <span className="text-[#dfe2f1] font-semibold">{subject}</span>
              </div>
              <div className="text-[#bdc8d1] text-[10px] pt-1 border-t border-[#262a35]">
                This will send an email from your authorized Gmail account ({profile?.emailAddress}) to the recipient.
              </div>
            </div>

            <p className="text-[12px] text-[#bdc8d1]">
              Are you sure you want to proceed and send this email?
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmAndSend}
                className="flex-1 py-2 rounded-lg bg-[#ea4335] hover:bg-[#f35345] text-white font-data-mono-sm text-[12px] font-bold shadow transition-all active:scale-95"
              >
                Yes, Send Email
              </button>
              <button
                type="button"
                onClick={() => setPendingConfirmSend(false)}
                className="px-4 py-2 rounded-lg bg-[#262a35] hover:bg-[#313540] text-[#dfe2f1] font-data-mono-sm text-[12px] border border-[#313540]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
