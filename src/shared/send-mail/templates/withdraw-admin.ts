import { renderEmailLayout } from './email-layout';

export interface WithdrawAdminEmailData {
  language?: 'cz' | 'en';
  name: string;
  email: string;
  orderNumber: string;
  submittedAt?: Date | string;
}

export function getWithdrawAdminEmailTemplate(data: WithdrawAdminEmailData) {
  const language = data.language ?? 'en';
  const isCzech = language === 'cz';
  const copy = isCzech
    ? {
        eyebrow: 'NOVÁ ŽÁDOST',
        title: 'Nová žádost o odstoupení od smlouvy',
        intro:
          'Byla podána nová žádost o odstoupení od smlouvy. Níže jsou uvedeny údaje zákazníka.',
        nameLabel: 'Jméno',
        emailLabel: 'E-mail',
        orderLabel: 'Číslo objednávky',
        dateLabel: 'Datum podání',
        statusLabel: 'Stav',
        statusValue: 'Čeká na vyřízení',
        action:
          'Žádost najdete v administraci, kde ji můžete zkontrolovat a zpracovat.',
      }
    : {
        eyebrow: 'NEW REQUEST',
        title: 'New withdrawal from contract request',
        intro:
          'A new withdrawal from contract request has been submitted. The customer details are below.',
        nameLabel: 'Name',
        emailLabel: 'Email',
        orderLabel: 'Order number',
        dateLabel: 'Submitted on',
        statusLabel: 'Status',
        statusValue: 'Pending review',
        action:
          'You can find this request in the admin dashboard to review and process it.',
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
    <p style="margin:0 0 24px;color:#66766c;font-size:15px;line-height:1.7;">${copy.intro}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;border:1px solid #dce4dc;border-radius:12px;border-spacing:0;overflow:hidden;background:#f3f3e9;">
      <tr>
        <td style="padding:14px 18px;border-bottom:1px solid #e5e7dc;color:#66766c;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${copy.nameLabel}</td>
        <td style="padding:14px 18px;border-bottom:1px solid #e5e7dc;color:#1d3124;font-size:14px;font-weight:700;text-align:right;">${data.name}</td>
      </tr>
      <tr>
        <td style="padding:14px 18px;border-bottom:1px solid #e5e7dc;color:#66766c;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${copy.emailLabel}</td>
        <td style="padding:14px 18px;border-bottom:1px solid #e5e7dc;text-align:right;"><a href="mailto:${data.email}" style="color:#c96d33;font-size:14px;font-weight:700;text-decoration:none;">${data.email}</a></td>
      </tr>
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
          <span style="display:inline-block;padding:7px 13px;border-radius:999px;background:#c96d33;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.4px;">${copy.statusValue}</span>
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
