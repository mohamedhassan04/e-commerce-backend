import { renderEmailLayout } from './email-layout';

export interface ContactAdminEmailData {
  language?: 'cz' | 'en';
  name: string;
  email: string;
  topic: 'order' | 'product' | 'wholesale' | 'other';
  message: string;
  submittedAt?: Date | string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function getContactAdminEmailTemplate(data: ContactAdminEmailData) {
  const language = data.language ?? 'en';
  const isCzech = language === 'cz';
  const copy = isCzech
    ? {
        eyebrow: 'NOVÁ ZPRÁVA',
        title: 'Nová zpráva z kontaktního formuláře',
        intro:
          'Přes kontaktní formulář na webu byla odeslána nová zpráva. Údaje odesílatele jsou uvedeny níže.',
        nameLabel: 'Jméno',
        emailLabel: 'E-mail',
        topicLabel: 'Téma',
        dateLabel: 'Odesláno',
        messageLabel: 'Zpráva',
        action: 'Na tuto zprávu můžete odpovědět přímo odesílateli.',
        topics: {
          order: 'Objednávka nebo doručení',
          product: 'Dotaz k produktu',
          wholesale: 'Velkoobchod a média',
          other: 'Jiné téma',
        },
      }
    : {
        eyebrow: 'NEW MESSAGE',
        title: 'New message from the contact form',
        intro:
          'A new message has been submitted through the website contact form. The sender details are below.',
        nameLabel: 'Name',
        emailLabel: 'Email',
        topicLabel: 'Topic',
        dateLabel: 'Submitted on',
        messageLabel: 'Message',
        action: 'You can reply directly to the sender using this email address.',
        topics: {
          order: 'An order or delivery',
          product: 'A product question',
          wholesale: 'Wholesale & press',
          other: 'Something else',
        },
      };

  const submittedAt = data.submittedAt
    ? new Date(data.submittedAt)
    : new Date();
  const day = String(submittedAt.getDate()).padStart(2, '0');
  const month = String(submittedAt.getMonth() + 1).padStart(2, '0');
  const formattedDate = isCzech
    ? `${day}.${month}.${submittedAt.getFullYear()}`
    : `${day}/${month}/${submittedAt.getFullYear()}`;

  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const message = escapeHtml(data.message).replace(/\r?\n/g, '<br />');
  const topic = escapeHtml(copy.topics[data.topic] ?? copy.topics.other);

  const content = `
    <p style="margin:0 0 24px;color:#66766c;font-size:15px;line-height:1.7;">${copy.intro}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;border:1px solid #dce4dc;border-radius:12px;border-spacing:0;overflow:hidden;background:#f3f3e9;">
      <tr>
        <td style="padding:14px 18px;border-bottom:1px solid #e5e7dc;color:#66766c;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${copy.nameLabel}</td>
        <td style="padding:14px 18px;border-bottom:1px solid #e5e7dc;color:#1d3124;font-size:14px;font-weight:700;text-align:right;">${name}</td>
      </tr>
      <tr>
        <td style="padding:14px 18px;border-bottom:1px solid #e5e7dc;color:#66766c;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${copy.emailLabel}</td>
        <td style="padding:14px 18px;border-bottom:1px solid #e5e7dc;text-align:right;"><a href="mailto:${email}" style="color:#c96d33;font-size:14px;font-weight:700;text-decoration:none;">${email}</a></td>
      </tr>
      <tr>
        <td style="padding:14px 18px;border-bottom:1px solid #e5e7dc;color:#66766c;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${copy.topicLabel}</td>
        <td style="padding:14px 18px;border-bottom:1px solid #e5e7dc;color:#1d3124;font-size:14px;font-weight:700;text-align:right;">${topic}</td>
      </tr>
      <tr>
        <td style="padding:14px 18px;color:#66766c;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${copy.dateLabel}</td>
        <td style="padding:14px 18px;color:#1d3124;font-size:14px;font-weight:700;text-align:right;">${formattedDate}</td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #dce4dc;border-radius:12px;background:#e2ece5;">
      <tr>
        <td style="padding:22px 20px;">
          <p style="margin:0 0 10px;color:#3c5243;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${copy.messageLabel}</p>
          <p style="margin:0;color:#3c5243;font-size:15px;line-height:1.7;">${message}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;padding:18px 0 0;border-top:1px solid #e5e7dc;color:#66766c;font-size:13px;line-height:1.6;">${copy.action}</p>`;

  return renderEmailLayout({
    language,
    eyebrow: copy.eyebrow,
    title: copy.title,
    content,
  });
}
