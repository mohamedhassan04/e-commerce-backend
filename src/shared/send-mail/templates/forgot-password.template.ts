export const getForgotPasswordTemplate = (resetCode: string, language: 'cz' | 'en' = 'en') => {
  const copy = language === 'cz'
    ? { title: 'Zapomenuté heslo', prompt: 'Zde je váš kód pro obnovení hesla:', expiry: 'Tento kód je platný po dobu 30 minut.' }
    : { title: 'Forgot password', prompt: 'Here is your password reset code:', expiry: 'This code is valid for 30 minutes.' };

  return `
<!DOCTYPE html>
<html lang="${language === 'cz' ? 'cs' : 'en'}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${copy.title}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 32px; text-align: center;">
              <h1 style="font-size: 22px; margin-bottom: 16px; color: #333;">${copy.title}</h1>
              <p style="font-size: 15px; color: #666; margin-bottom: 24px;">${copy.prompt}</p>
              <div style="display: inline-block; padding: 14px 32px; background-color: #000; color: #fff; font-size: 20px; font-weight: bold; letter-spacing: 2px; border-radius: 6px;">${resetCode}</div>
              <p style="font-size: 13px; color: #999; margin-top: 24px;">${copy.expiry}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};
