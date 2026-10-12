export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  isUnread: boolean;
  labelIds: string[];
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

// Helper to decode Base64URL string
function decodeBase64Url(str: string): string {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  }
}

// Helper to encode string to RFC 2822 Base64URL
function encodeBase64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function fetchGmailProfile(accessToken: string): Promise<GmailProfile> {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch Gmail profile: ${res.status} ${err}`);
  }
  return res.json();
}

export async function fetchGmailMessages(
  accessToken: string,
  options: { query?: string; maxResults?: number } = {}
): Promise<GmailMessageSummary[]> {
  const { query = '', maxResults = 15 } = options;
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  params.append('maxResults', maxResults.toString());

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!listRes.ok) {
    const err = await listRes.text();
    throw new Error(`Failed to list messages: ${listRes.status} ${err}`);
  }

  const listData = await listRes.json();
  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  // Fetch headers & details for each message (first batch)
  const summaries: GmailMessageSummary[] = await Promise.all(
    listData.messages.slice(0, maxResults).map(async (msgItem: { id: string; threadId: string }) => {
      try {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgItem.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!detailRes.ok) {
          return {
            id: msgItem.id,
            threadId: msgItem.threadId,
            snippet: '',
            subject: 'Email Message',
            from: 'Unknown',
            date: '',
            isUnread: false,
            labelIds: [],
          };
        }

        const detail = await detailRes.json();
        const headers: { name: string; value: string }[] = detail.payload?.headers || [];
        const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || 'Unknown';
        const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || '';
        const isUnread = (detail.labelIds || []).includes('UNREAD');

        return {
          id: detail.id,
          threadId: detail.threadId,
          snippet: detail.snippet || '',
          subject,
          from,
          date,
          isUnread,
          labelIds: detail.labelIds || [],
        };
      } catch {
        return {
          id: msgItem.id,
          threadId: msgItem.threadId,
          snippet: '',
          subject: 'Email Message',
          from: 'Unknown',
          date: '',
          isUnread: false,
          labelIds: [],
        };
      }
    })
  );

  return summaries;
}

export async function fetchMessageContent(
  accessToken: string,
  messageId: string
): Promise<{ id: string; subject: string; from: string; date: string; body: string }> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch full message body');
  }

  const data = await res.json();
  const headers: { name: string; value: string }[] = data.payload?.headers || [];
  const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
  const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || 'Unknown';
  const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || '';

  let body = '';
  if (data.payload?.parts) {
    for (const part of data.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        body = decodeBase64Url(part.body.data);
        break;
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        body = decodeBase64Url(part.body.data);
      }
    }
  } else if (data.payload?.body?.data) {
    body = decodeBase64Url(data.payload.body.data);
  }

  if (!body) {
    body = data.snippet || '(No content available)';
  }

  return { id: messageId, subject, from, date, body };
}

export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  htmlBody: string
): Promise<{ id: string }> {
  const emailLines = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    htmlBody,
  ];

  const raw = encodeBase64Url(emailLines.join('\r\n'));

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to send email: ${res.status} ${err}`);
  }

  return res.json();
}
