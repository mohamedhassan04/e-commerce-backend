import { renderEmailLayout } from './email-layout';

export const getEmailWelcomeTemplate = (
  name: string,
  email: string,
  tempPassword: string,
  language: 'cz' | 'en' = 'en',
) => {
  const isCzech = language === 'cz';
  const copy = isCzech
    ? {
        eyebrow: 'VÁŠ ÚČET',
        title: 'Vítejte ve Verdant & Co.',
        greeting: 'Dobrý den',
        message: 'Váš účet je připraven. Níže najdete své přihlašovací údaje.',
        email: 'E-mail',
        password: 'Dočasné heslo',
        visit: 'Přejít na účet',
        warning: 'Z bezpečnostních důvodů si po přihlášení změňte dočasné heslo.',
      }
    : {
        eyebrow: 'YOUR ACCOUNT',
        title: 'Welcome to Verdant & Co.',
        greeting: 'Hello',
        message: 'Your account is ready. Here are your sign-in details.',
        email: 'Email',
        password: 'Temporary password',
        visit: 'Go to your account',
        warning: 'For your security, change your temporary password after signing in.',
      };
  const content = `
    <p style="margin:0 0 10px;color:#1d3124;font-size:16px;line-height:1.6;">${copy.greeting} <strong>${name}</strong>,</p>
    <p style="margin:0 0 24px;color:#66766c;font-size:15px;line-height:1.7;">${copy.message}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #dce4dc;border-radius:12px;background:#e2ece5;">
      <tr><td style="padding:18px 20px;border-bottom:1px solid #d1ddd3;color:#66766c;font-size:12px;">${copy.email}</td><td style="padding:18px 20px;border-bottom:1px solid #d1ddd3;color:#1d3124;font-size:14px;font-weight:600;text-align:right;">${email}</td></tr>
      <tr><td style="padding:18px 20px;color:#66766c;font-size:12px;">${copy.password}</td><td style="padding:18px 20px;color:#1d3124;font-family:monospace;font-size:14px;font-weight:700;text-align:right;">${tempPassword}</td></tr>
    </table>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 0;">
      <tr><td align="center" style="border-radius:999px;background:#1d3124;">
        <a href="${process.env.FRONTEND_PATH}login" style="display:inline-block;padding:14px 23px;color:#faf9f1;font-size:14px;font-weight:700;text-decoration:none;">${copy.visit}</a>
      </td></tr>
    </table>
    <p style="margin:23px 0 0;padding-top:18px;border-top:1px solid #e5e7dc;color:#66766c;font-size:13px;line-height:1.6;">${copy.warning}</p>`;

  return renderEmailLayout({
    language,
    eyebrow: copy.eyebrow,
    title: copy.title,
    content,
  });
};
