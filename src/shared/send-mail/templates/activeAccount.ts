import { renderEmailLayout } from './email-layout';

export const getEmailVerificationTemplate = (
  verificationCode: string,
  language: 'cz' | 'en' = 'en',
) => {
  const isCzech = language === 'cz';
  const copy = isCzech
    ? {
        eyebrow: 'PŘÍSTUP K ÚČTU',
        title: 'Ověřte svůj účet',
        prompt: 'Zadejte tento ověřovací kód a dokončete vytvoření účtu.',
        expiry: 'Kód je platný 30 minut.',
      }
    : {
        eyebrow: 'ACCOUNT ACCESS',
        title: 'Verify your account',
        prompt: 'Enter this verification code to finish setting up your account.',
        expiry: 'This code is valid for 30 minutes.',
      };
  const content = `
    <p style="margin:0 0 22px;color:#66766c;font-size:15px;line-height:1.7;">${copy.prompt}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #dce4dc;border-radius:12px;background:#e2ece5;">
      <tr><td align="center" style="padding:25px 16px;">
        <p style="margin:0;color:#14231a;font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:700;letter-spacing:6px;">${verificationCode}</p>
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
