import { renderEmailLayout } from './email-layout';

export const getForgotPasswordTemplate = (
  resetCode: string,
  language: 'cz' | 'en' = 'en',
) => {
  const isCzech = language === 'cz';
  const copy = isCzech
    ? {
        eyebrow: 'PŘÍSTUP K ÚČTU',
        title: 'Obnovte své heslo',
        prompt: 'Použijte tento kód k obnovení hesla.',
        expiry: 'Kód je platný 30 minut. Pokud jste o něj nežádali, můžete tento e-mail ignorovat.',
      }
    : {
        eyebrow: 'ACCOUNT ACCESS',
        title: 'Reset your password',
        prompt: 'Use this code to reset your password.',
        expiry: "This code is valid for 30 minutes. If you didn't request it, you can ignore this email.",
      };
  const content = `
    <p style="margin:0 0 22px;color:#66766c;font-size:15px;line-height:1.7;">${copy.prompt}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #f0d4bd;border-radius:12px;background:#fae9d8;">
      <tr><td align="center" style="padding:25px 16px;">
        <p style="margin:0;color:#14231a;font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:700;letter-spacing:6px;">${resetCode}</p>
      </td></tr>
    </table>
    <p style="margin:18px 0 0;color:#66766c;font-size:13px;line-height:1.6;">${copy.expiry}</p>`;

  return renderEmailLayout({
    language,
    eyebrow: copy.eyebrow,
    title: copy.title,
    content,
  });
};
