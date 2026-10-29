export interface EmailLayoutOptions {
  language: 'cz' | 'en';
  eyebrow: string;
  title: string;
  content: string;
}

export function renderEmailLayout({
  language,
  eyebrow,
  title,
  content,
}: EmailLayoutOptions): string {
  const isCzech = language === 'cz';
  const footer = isCzech
    ? 'S péčí připraveno společností Verdant & Co.'
    : 'Thoughtfully prepared by Verdant & Co.';

  return `
<!DOCTYPE html>
<html lang="${isCzech ? 'cs' : 'en'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${title}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .email-outer { padding: 12px !important; }
      .email-card { border-radius: 14px !important; }
      .email-content { padding: 30px 22px !important; }
      .email-title { font-size: 30px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f6f4e8;font-family:Arial,Helvetica,sans-serif;color:#1d3124;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${title}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f6f4e8;">
    <tr>
      <td class="email-outer" align="center" style="padding:36px 16px;">
        <table class="email-card" role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#faf9f1;border:1px solid #e5e7dc;border-radius:20px;overflow:hidden;">
          <tr>
            <td height="5" style="height:5px;background:#e59560;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:23px 34px;background:#1d3124;">
              <p style="margin:0;color:#faf9f1;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;letter-spacing:1.4px;">VERDANT <span style="color:#bacec1;">&amp; CO.</span></p>
            </td>
          </tr>
          <tr>
            <td class="email-content" style="padding:42px 42px 38px;">
              <p style="display:inline-block;margin:0 0 16px;padding:7px 11px;border-radius:999px;background:#e2ece5;color:#3c5243;font-size:10px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;">${eyebrow}</p>
              <h1 class="email-title" style="margin:0;color:#14231a;font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:500;line-height:1.16;letter-spacing:-0.5px;">${title}</h1>
              <div style="width:44px;height:3px;margin:22px 0 24px;background:#e59560;border-radius:3px;font-size:0;line-height:0;">&nbsp;</div>
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 30px;background:#eeead9;border-top:1px solid #e5e1d1;text-align:center;">
              <p style="margin:0;color:#66766c;font-size:12px;line-height:1.6;">${footer}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
