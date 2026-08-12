export const getEmailWelcomeTemplate = (
  name: string,
  email: string,
  tempPassword: string,
) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
      .container { background: #fff; padding: 30px; border-radius: 8px; max-width: 500px; margin: auto; }
      .credentials { background: #f0f4ff; border: 1px solid #d0d9ff; border-radius: 6px; padding: 16px; margin: 20px 0; }
      .credentials p { margin: 6px 0; font-size: 15px; }
      .btn { display: inline-block; font-size: 15px; font-weight: 700; width: 100%;  margin-top: 20px; padding: 12px 24px; background: #0157a4 ; color: #fff; border-radius: 6px; text-decoration: none; }
      .warning { font-size: 15px; font-weight: 400; color: #888; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Bienvenue, ${name} 👋</h2>
      <p>Votre compte a été créé sur la plateforme pour le client de votre entreprise.</p>
      <p><strong>Voici vos identifiants de connexion :</strong></p>

      <div class="credentials">
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Mot de passe temporaire :</strong> <code>${tempPassword}</code></p>
      </div>

      <a href="${process.env.FRONTEND_PATH}login"
       style="display:block; text-align:center; font-size:15px; font-weight:700; width:100%; margin-top:20px; padding:12px 24px; background:#0157a4; color:#fff; border-radius:6px; text-decoration:none; box-sizing:border-box;">
       Visiter la plateforme
      </a>

      <p class="warning">
        ⚠️ Pour des raisons de sécurité, veuillez changer votre mot de passe
        dès votre première connexion.
      </p>
    </div>
  </body>
</html>
`;
