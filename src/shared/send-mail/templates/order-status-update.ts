const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const CZECH_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Čeká na vyřízení',
  CONFIRMED: 'Potvrzeno',
  SHIPPED: 'Odesláno',
  DELIVERED: 'Doručeno',
  CANCELLED: 'Zrušeno',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f0ad4e',
  CONFIRMED: '#5bc0de',
  SHIPPED: '#0275d8',
  DELIVERED: '#5cb85c',
  CANCELLED: '#d9534f',
};

export interface OrderStatusUpdateEmailData {
  language?: 'cz' | 'en';
  ref: string;
  clientName: string;
  status: string;
}

export function getOrderStatusUpdateTemplate(data: OrderStatusUpdateEmailData) {
  const isCzech = data.language === 'cz';
  const statusLabel = (isCzech ? CZECH_STATUS_LABELS : STATUS_LABELS)[data.status] || data.status;
  const statusColor = STATUS_COLORS[data.status] || '#333';
  const copy = isCzech
    ? {
        title: 'Aktualizace stavu objednávky', greeting: 'Dobrý den', customer: 'zákazníku',
        updated: 'Stav vaší objednávky', changed: 'byl aktualizován.',
        questions: 'Máte-li jakékoli dotazy, odpovězte na tento e-mail.',
        thanks: 'Děkujeme za vaši objednávku.',
      }
    : {
        title: 'Order Status Update', greeting: 'Hi', customer: 'Customer',
        updated: 'Your order', changed: 'status has been updated.',
        questions: 'If you have any questions, reply to this email.',
        thanks: 'Thank you for your order.',
      };

  return `
<!DOCTYPE html>
<html lang="${isCzech ? 'cs' : 'en'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${copy.title} - ${data.ref}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f4;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">

          <tr>
            <td style="background:#1a1a2e;padding:32px 28px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${copy.title}</h1>
              <p style="margin:8px 0 0;color:#aaa;font-size:14px;">${data.ref}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 16px;font-size:15px;color:#333;">
                ${copy.greeting} <strong>${data.clientName || copy.customer}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                ${copy.updated} <strong>${data.ref}</strong> ${copy.changed}
              </p>

              <div style="text-align:center;margin:24px 0;">
                <span style="display:inline-block;padding:12px 28px;border-radius:6px;background:${statusColor};color:#fff;font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                  ${statusLabel}
                </span>
              </div>

              <p style="margin:24px 0 0;font-size:14px;color:#777;line-height:1.6;text-align:center;">
                ${copy.questions}
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f9f9f9;padding:20px 28px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:13px;color:#999;">
                ${copy.thanks}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
