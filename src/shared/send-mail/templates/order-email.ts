import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { formatPrice } from 'src/shared/utils/utils';

dayjs.locale('fr');

function buildItemRows(items: any[]) {
  return (
    items &&
    items
      .map((item, i) => {
        const bg = i % 2 === 0 ? '#ffffff' : '#fafbfc';
        const refCell = item.reference
          ? `<span style="font-size:12px;font-family:monospace;background:#eef3f9;color:#0157a4;padding:3px 8px;border-radius:5px;font-weight:700;letter-spacing:0.5px;">${item.reference}</span>`
          : `<span style="font-size:12px;color:#cccccc;">—</span>`;

        return `
      <tr style="background-color:${bg};">
        <td class="ref-col" style="padding:14px 12px;border-bottom:1px solid #edf0f4;vertical-align:middle;">
          ${refCell}
        </td>
          <td style="width:240px;padding:14px 16px;border-bottom:1px solid #edf0f4;vertical-align:middle;">
          <div style="font-size:14px;font-weight:700;color:#111111;">${item.productName}</div>
        </td>
        <td class="qty-col" style="padding:14px 12px;border-bottom:1px solid #edf0f4;text-align:center;vertical-align:middle;">
          <span style="display:inline-block;background:#0157a4;color:#fff;font-size:12px;font-weight:800;width:26px;height:26px;border-radius:50%;line-height:26px;text-align:center;">${item.quantity}</span>
        </td>
        <td style="padding:14px 12px;border-bottom:1px solid #edf0f4;font-size:14px;color:#666666;vertical-align:middle;white-space:nowrap;">${formatPrice(item.priceUHT)}</td>
        <td style="padding:14px 16px;border-bottom:1px solid #edf0f4;text-align:right;font-size:15px;font-weight:800;color:#0157a4;vertical-align:middle;white-space:nowrap;">${formatPrice(item.priceTTC)}</td>
      </tr>`;
      })
      .join('')
  );
}

export function getOrderEmailTemplate(data: any) {
  const tva = parseFloat((data.totalTTC - data.totalHT).toFixed(3));

  // Change this value to adjust the overall width of the email
  const containerWidth = '750';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nouvelle Commande - N° ${data.orderNumber || '2026/001'}</title>
  <style>
    @media only screen and (max-width: ${containerWidth}px) {
      .email-card  { width: 100% !important; border-radius: 0 !important; }
      .outer-pad   { padding: 0 !important; }
      .section-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .header-cell { padding: 28px 24px 24px !important; }
      .table-wrap  { overflow-x: auto !important; display: block !important; -webkit-overflow-scrolling: touch; }
      .ref-col     { display: none !important; }
      .qty-col     { display: none !important; }
      .total-badge { font-size: 15px !important; padding: 5px 12px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
 
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#f0f2f5;line-height:1px;">
    Nouvelle commande reçue — Veuillez préparer les articles listés ci-dessous.
  </div>
 
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f0f2f5;">
    <tr>
      <td align="center" class="outer-pad" style="padding:40px 16px;">
 
        <table role="presentation" class="email-card" width="${containerWidth}" cellspacing="0" cellpadding="0" border="0"
               style="max-width:${containerWidth}px;width:${containerWidth}px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">
 
          <tr>
            <td class="header-cell" style="background-color:#0157a4;padding:36px 36px 30px 36px;">
              <div style="display:inline-block;background-color:#ea0026;border-radius:8px;padding:5px 14px;margin-bottom:16px;">
                <span style="font-size:12px;font-weight:800;color:#ffffff;letter-spacing:3px;text-transform:uppercase;">${data.clientName}</span>
              </div>
              <div style="font-size:26px;font-weight:800;color:#ffffff;line-height:1.25;letter-spacing:-0.5px;">
                Nouvelle Commande Reçue - N° ${data.ref}
              </div>
              <div style="margin-top:8px;font-size:14px;color:rgba(255,255,255,0.68);line-height:1.6;">
                Une nouvelle commande a été passée et nécessite votre traitement.
              </div>
            </td>
          </tr>
 
          <tr>
            <td class="section-pad" style="padding:0 36px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                     style="background:linear-gradient(135deg,#111111 0%,#2d2d2d 100%);border-radius:0 0 14px 14px;overflow:hidden;">
                <tr>
                  <td style="padding:16px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;">
                          <div style="font-size:10px;color:rgba(255,255,255,0.45);font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:4px;">Date de la commande</div>
                          <div style="font-size:17px;font-weight:800;color:#ffffff;">${dayjs(data.orderDate).format('DD MMMM YYYY à HH:mm')}</div>
                        </td>
                        <td align="right" style="vertical-align:middle;">
                          <div style="background-color:#0157a4;border-radius:10px;padding:9px 14px;display:inline-block;">
                            <span style="font-size:20px;line-height:1;">🗓️</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
 
          <tr>
            <td class="section-pad" style="padding:28px 36px 0 36px;">
              <p style="margin:0;font-size:15px;color:#555555;line-height:1.75;">
                Bonjour, vous avez reçu une nouvelle commande passée par
                <strong style="color:#0157a4;">${data.orderBy}${data.clientName ? ` (${data.clientName})` : ''}</strong>.
              </p>
              <p style="margin:0;font-size:15px;color:#555555;line-height:1.75;">
                Type de livraison
                <strong style="color:#0157a4;">${data.deliveryWith}</strong>.
              </p>
            </td>
          </tr>
 
          <tr>
            <td class="section-pad" style="padding:24px 36px 0 36px;">
              <div style="height:2px;background:linear-gradient(90deg,#0157a4 0%,#ea0026 55%,#f0f2f5 100%);border-radius:2px;"></div>
            </td>
          </tr>
 
          <tr>
            <td class="section-pad" style="padding:22px 36px 14px 36px;">
              <span style="font-size:10px;font-weight:800;color:#0157a4;letter-spacing:3px;text-transform:uppercase;">Détail des Articles</span>
            </td>
          </tr>
 
          <tr>
            <td class="section-pad" style="padding:0 36px;">
              <div class="table-wrap" style="border-radius:12px;overflow:hidden;border:1px solid #e4e8ee;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                       style="border-collapse:collapse;min-width:480px;">
 
                  <thead>
                    <tr style="background-color:#0157a4;">
                      <th class="ref-col" style="padding:12px 12px;text-align:left;font-size:10px;font-weight:800;color:rgba(255,255,255,0.88);letter-spacing:2px;text-transform:uppercase;white-space:nowrap;">Référence</th>
                      <th style="width:240px;padding:12px 16px;text-align:left;font-size:10px;font-weight:800;color:rgba(255,255,255,0.88);letter-spacing:2px;text-transform:uppercase;white-space:nowrap;">Produit</th>
                      <th class="qty-col" style="padding:12px 12px;text-align:center;font-size:10px;font-weight:800;color:rgba(255,255,255,0.88);letter-spacing:2px;text-transform:uppercase;white-space:nowrap;">Qté</th>
                      <th style="padding:12px 12px;text-align:left;font-size:10px;font-weight:800;color:rgba(255,255,255,0.88);letter-spacing:2px;text-transform:uppercase;white-space:nowrap;">P.U HT</th>
                      <th style="padding:12px 16px;text-align:right;font-size:10px;font-weight:800;color:rgba(255,255,255,0.88);letter-spacing:2px;text-transform:uppercase;white-space:nowrap;">Total TTC</th>
                    </tr>
                  </thead>
 
                  <tbody>
                    ${buildItemRows(data.items)}
 
                    <tr style="background-color:#f4f6f9;">
                      <td class="ref-col" style="padding:11px 16px;border-bottom:1px solid #e0e4ea;"></td>
                      <td class="qty-col" style="padding:11px 12px;border-bottom:1px solid #e0e4ea;"></td>
                      <td colspan="2" style="padding:11px 12px;border-bottom:1px solid #e0e4ea;font-size:11px;color:#999999;font-weight:700;text-transform:uppercase;letter-spacing:1px;white-space:nowrap;">Sous-total HT</td>
                      <td style="padding:11px 16px;border-bottom:1px solid #e0e4ea;text-align:right;font-size:14px;font-weight:700;color:#333333;white-space:nowrap;">${formatPrice(data.totalHT)}</td>
                    </tr>
 
                    <tr style="background-color:#f4f6f9;">
                      <td class="ref-col" style="padding:11px 16px;border-bottom:1px solid #e0e4ea;"></td>
                      <td class="qty-col" style="padding:11px 12px;border-bottom:1px solid #e0e4ea;"></td>
                      <td colspan="2" style="padding:11px 12px;border-bottom:1px solid #e0e4ea;font-size:11px;color:#999999;font-weight:700;text-transform:uppercase;letter-spacing:1px;white-space:nowrap;">TVA</td>
                      <td style="padding:11px 16px;border-bottom:1px solid #e0e4ea;text-align:right;font-size:14px;font-weight:700;color:#333333;white-space:nowrap;">${formatPrice(tva)}</td>
                    </tr>
 
                    <tr style="background-color:#0157a4;">
                      <td class="ref-col" style="padding:16px;"></td>
                      <td class="qty-col" style="padding:16px;"></td>
                      <td colspan="2" style="padding:16px 12px;font-size:12px;font-weight:800;color:rgba(255,255,255,0.80);text-transform:uppercase;letter-spacing:1.5px;white-space:nowrap;">Total TTC</td>
                      <td style="padding:16px;text-align:right;">
                        <span class="total-badge" style="background-color:#ea0026;color:#ffffff;font-size:17px;font-weight:900;padding:6px 14px;border-radius:8px;display:inline-block;white-space:nowrap;">${formatPrice(data.totalTTC)}</span>
                      </td>
                    </tr>
 
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
 
          <tr>
            <td class="section-pad" style="padding:20px 36px 0 36px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                     style="background-color:#fff8e1;border-radius:10px;border-left:4px solid #ea0026;overflow:hidden;">
                <tr>
                  <td style="padding:14px 18px;">
                    <div style="font-size:10px;font-weight:800;color:#ea0026;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">⚠ Note importante</div>
                    <div style="font-size:13px;color:#666666;line-height:1.65;">
                      Veuillez préparer les articles listés ci-dessous dans les meilleurs délais.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
 
          <tr>
            <td class="section-pad" style="padding:28px 36px 32px 36px;">
              <div style="height:1px;background:#eeeeee;margin-bottom:20px;"></div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="display:inline-block;background-color:#ea0026;border-radius:6px;padding:4px 10px;margin-bottom:8px;">
                      <span style="font-size:10px;font-weight:800;color:#ffffff;letter-spacing:2px;text-transform:uppercase;">CDG</span>
                    </div>
                    <div style="font-size:12px;color:#aaaaaa;line-height:1.7;margin-top:2px;">
                     Rue Khawarzmi Saint Gaubin Mégrine<br/>
                      © ${new Date().getFullYear()} CDG — Tous droits réservés
                    </div>
                  </td>
                </tr>
              </table>
              <div style="margin-top:14px;font-size:11px;color:#cccccc;text-align:center;">
                Cet email est destiné à votre usage interne en tant que fournisseur.
              </div>
            </td>
          </tr>
 
        </table>
      </td>
    </tr>
  </table>
 
</body>
</html>`;
}
