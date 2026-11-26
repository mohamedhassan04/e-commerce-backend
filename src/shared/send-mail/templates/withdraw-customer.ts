import { renderEmailLayout } from './email-layout';

export interface WithdrawCustomerEmailData {
  language?: 'cz' | 'en';
  name: string;
  orderNumber: string;
  submittedAt?: Date | string;
}

export function getWithdrawCustomerEmailTemplate(
  data: WithdrawCustomerEmailData,
) {
  const language = data.language ?? 'en';
  const isCzech = language === 'cz';
  const copy = isCzech
    ? {
        eyebrow: 'ODSTOUPENÍ OD SMLOUVY',
        title: 'Vaše žádost byla přijata',
        greeting: 'Dobrý den',
        customer: 'zákazníku',
        intro:
          'Potvrzujeme, že jsme obdrželi vaši žádost o odstoupení od smlouvy k objednávce níže.',
        orderLabel: 'Číslo objednávky',
        dateLabel: 'Datum podání',
        statusLabel: 'Stav žádosti',
        statusValue: 'Čeká na vyřízení',
        nextTitle: 'Co bude následovat?',
        nextText:
          'Naši kolegové žádost posoudí a budou vás kontaktovat na e-mail uvedený v žádosti. Pokud budete potřebovat pomoc, odpovězte na tento e-mail.',
      }
    : {
        eyebrow: 'WITHDRAWAL FROM CONTRACT',
        title: 'Your request has been received',
        greeting: 'Hello',
        customer: 'Customer',
        intro:
          'We confirm that we have received your withdrawal from contract request for the order below.',
        orderLabel: 'Order number',
        dateLabel: 'Submitted on',
        statusLabel: 'Request status',
        statusValue: 'Pending review',
        nextTitle: 'What happens next?',
        nextText:
          'Our team will review your request and contact you at the email address provided. If you need help, simply reply to this email.',
      };

  const submittedAt = data.submittedAt
    ? new Date(data.submittedAt)
    : new Date();
  const day = String(submittedAt.getDate()).padStart(2, '0');
  const month = String(submittedAt.getMonth() + 1).padStart(2, '0');
  const formattedDate = isCzech
    ? `${day}.${month}.${submittedAt.getFullYear()}`
    : `${day}/${month}/${submittedAt.getFullYear()}`;

  const content = `
    <p style="margin:0 0 10px;color:#1d3124;font-size:16px;line-height:1.6;">${copy.greeting} <strong>${data.name || copy.customer}</strong>,</p>
    <p style="margin:0 0 24px;color:#66766c;font-size:15px;line-height:1.7;">${copy.intro}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;border:1px solid #dce4dc;border-radius:12px;border-spacing:0;overflow:hidden;background:#f3f3e9;">
      <tr>
        <td style="padding:14px 18px;border-bottom:1px solid #e5e7dc;color:#66766c;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${copy.orderLabel}</td>
        <td style="padding:14px 18px;border-bottom:1px solid #e5e7dc;color:#1d3124;font-size:14px;font-weight:700;text-align:right;">${data.orderNumber}</td>
      </tr>
      <tr>
        <td style="padding:14px 18px;border-bottom:1px solid #e5e7dc;color:#66766c;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${copy.dateLabel}</td>
        <td style="padding:14px 18px;border-bottom:1px solid #e5e7dc;color:#1d3124;font-size:14px;font-weight:700;text-align:right;">${formattedDate}</td>
      </tr>
      <tr>
        <td style="padding:14px 18px;color:#66766c;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${copy.statusLabel}</td>
        <td style="padding:14px 18px;text-align:right;">
          <span style="display:inline-block;padding:7px 13px;border-radius:999px;background:#e59560;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.4px;">${copy.statusValue}</span>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #dce4dc;border-radius:12px;background:#e2ece5;">
      <tr>
        <td style="padding:22px 20px;">
          <p style="margin:0 0 8px;color:#3c5243;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;">${copy.nextTitle}</p>
          <p style="margin:0;color:#3c5243;font-size:14px;line-height:1.7;">${copy.nextText}</p>
        </td>
      </tr>
    </table>`;

  return renderEmailLayout({
    language,
    eyebrow: copy.eyebrow,
    title: copy.title,
    content,
  });
}
