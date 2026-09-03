export const getEmailVerificationTemplate = (verificationCode: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vérification de compte</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 32px; text-align: center;">
              <h1 style="font-size: 22px; margin-bottom: 16px; color: #333;">Vérification de compte</h1>
              <p style="font-size: 15px; color: #666; margin-bottom: 24px;">Voici votre code de vérification :</p>
              <div style="display: inline-block; padding: 14px 32px; background-color: #000; color: #fff; font-size: 20px; font-weight: bold; letter-spacing: 2px; border-radius: 6px;">${verificationCode}</div>
              <p style="font-size: 13px; color: #999; margin-top: 24px;">Ce code est valable pendant 30 minutes.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
