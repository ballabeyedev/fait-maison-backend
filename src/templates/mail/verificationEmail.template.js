function verificationEmailTemplate({ nom, code }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Vérification de votre email</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#e07b39;padding:32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">🍽️ Fait Maison</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <h2 style="color:#222;margin:0 0 16px;font-size:20px;">Bonjour ${nom},</h2>
            <p style="color:#555;line-height:1.7;margin:0 0 24px;">
              Merci de vous être inscrit sur <strong>Fait Maison</strong>. Veuillez confirmer votre adresse email en utilisant le code ci-dessous.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <div style="display:inline-block;background:#fff7f0;border:2px solid #e07b39;border-radius:12px;padding:20px 40px;">
                <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#e07b39;">${code}</span>
              </div>
            </div>
            <p style="color:#888;font-size:13px;margin:0 0 8px;">⏱️ Ce code est valable <strong>24 heures</strong>.</p>
            <p style="color:#888;font-size:13px;margin:0;">
              Si vous n'avez pas créé de compte, ignorez cet email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#fafafa;padding:20px 48px;text-align:center;border-top:1px solid #f0f0f0;">
            <p style="color:#bbb;font-size:12px;margin:0;">© ${new Date().getFullYear()} Fait Maison — Tous droits réservés</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

module.exports = verificationEmailTemplate;
