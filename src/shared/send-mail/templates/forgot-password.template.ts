export const getForgotPasswordTemplate = (resetCode: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mot de passe oublié</title>
  <style>
    /* Reset styles */
    body, table, td, div, p, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      border-collapse: collapse;
    }

    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }

    /* Base */
    body {
      font-family: 'Inter', Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #E0FFFF;
      background-color: #00464D;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      width: 100% !important;
    }

    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #00464D;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .header {
      padding: 32px 32px 16px;
      text-align: center;
    }

    .logo {
      font-size: 24px;
      font-weight: 900;
      color: #E0FFFF;
      display: inline-block;
    }

    .content {
      padding: 32px;
      text-align: center;
    }

    .title {
      font-size: 30px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #E0FFFF;
      line-height: 1.2;
    }

    .description {
      color: #A3D9D9;
      max-width: 448px;
      margin: 0 auto 32px;
      line-height: 1.625;
      font-size: 15px;
    }

    .code-container {
      display: inline-block;
      width: 100%;
      max-width: 320px;
      margin: 0 auto;
    }

    .reset-code {
      display: block;
      padding: 16px 32px;
      background-color: #C8FD01;
      border-radius: 12px;
      color: #00464D;
      font-weight: 800;
      font-size: 18px;
      letter-spacing: 1px;
      text-align: center;
    }

    .info-section {
      padding: 16px 32px 32px;
      border-top: 1px solid rgba(0, 90, 97, 0.2);
      color: #A3D9D9;
    }

    .info-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #E0FFFF;
      text-align: center;
    }

    .info-subtitle {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #E0FFFF;
    }

    .info-list {
      list-style-type: disc;
      margin-left: 20px;
      margin-bottom: 24px;
      font-size: 14px;
    }

    .info-list li {
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .footer {
      padding: 16px 32px 32px;
      border-top: 1px solid rgba(0, 90, 97, 0.2);
      text-align: center;
    }

    .footer-text {
      font-size: 14px;
      color: #A3D9D9;
      margin-bottom: 16px;
    }

    .social-links {
      display: block;
      text-align: center;
    }

    .social-link {
      display: inline-block;
      margin: 0 8px;
      text-decoration: none;
      color: rgba(163, 217, 217, 0.7);
    }

    .social-icon {
      width: 24px;
      height: 24px;
      display: block;
    }

    .link {
      color: #C8FD01;
      text-decoration: none;
    }

    /* Outlook fixes */
    #outlook a { padding: 0; }
    .ExternalClass { width: 100%; }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, 
    .ExternalClass td, .ExternalClass div { line-height: 100%; }

    /* Responsive */
    @media only screen and (max-width: 640px) {
      .header, .content, .info-section, .footer {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }

      .title {
        font-size: 24px !important;
      }

      .reset-code {
        padding: 12px 24px !important;
        font-size: 16px !important;
      }
    }
  </style>
</head>

<body>
  <center>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center">
          <table class="container" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600">
            
            <!-- Header -->
            <tr>
              <td class="header">
                <div class="logo">County</div>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td class="content">
                <h1 class="title">Mot de passe oublié ? Pas de souci !</h1>
                <p class="description">
                  Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte County.
                  Utilisez le code ci-dessous pour créer un nouveau mot de passe et retrouver l'accès.
                </p>

                <div class="code-container">
                  <div class="reset-code">${resetCode}</div>
                </div>

                <p class="description">
                  Ce code est valable pendant les 30 prochaines minutes. Pour des raisons de sécurité, si le code expire, vous devrez relancer la procédure.
                </p>
              </td>
            </tr>

            <!-- Info Section -->
            <tr>
              <td class="info-section">
                <h2 class="info-title">Informations importantes</h2>

                <div>
                  <h3 class="info-subtitle">Conseils de sécurité et de récupération de compte :</h3>
                  <ul class="info-list">
                    <li><strong>Créez un mot de passe fort :</strong> utilisez une combinaison de majuscules, minuscules, chiffres et symboles.</li>
                    <li><strong>Gardez-le privé :</strong> ne partagez jamais votre mot de passe avec qui que ce soit.</li>
                    <li><strong>Mises à jour régulières :</strong> changez votre mot de passe périodiquement.</li>
                    <li><strong>Sécurisez votre appareil :</strong> assurez-vous que votre appareil dispose d’un logiciel de sécurité à jour.</li>
                  </ul>
                </div>

                <div>
                  <h3 class="info-subtitle">Vous n'avez pas demandé cela ?</h3>
                  <p>
                    Si vous n'avez pas initié cette réinitialisation de mot de passe, veuillez ignorer cet e-mail.
                    Votre compte reste sécurisé. Cependant, si vous êtes inquiet, contactez notre équipe d'assistance à
                    <a href="mailto:support@county.com" class="link">support@county.com</a>.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="footer">
                <p class="footer-text">
                  Vous recevez cet e-mail parce que vous avez demandé une réinitialisation de mot de passe pour votre compte County.
                </p>

                <div class="social-links">
                  <a href="#" class="social-link"><img src="https://yourdomain.com/images/facebook.png" alt="Facebook" class="social-icon" /></a>
                  <a href="#" class="social-link"><img src="https://yourdomain.com/images/twitter.png" alt="Twitter" class="social-icon" /></a>
                  <a href="#" class="social-link"><img src="https://yourdomain.com/images/github.png" alt="GitHub" class="social-icon" /></a>
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
`;
