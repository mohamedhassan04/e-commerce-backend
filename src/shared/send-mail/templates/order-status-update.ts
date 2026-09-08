const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f0ad4e',
  CONFIRMED: '#5bc0de',
  SHIPPED: '#0275d8',
  DELIVERED: '#5cb85c',
  CANCELLED: '#d9534f',
};

export function getOrderStatusUpdateTemplate(data: {
  ref: string;
  clientName: string;
  status: string;
}) {
  const statusLabel = STATUS_LABELS[data.status] || data.status;
  const statusColor = STATUS_COLORS[data.status] || '#333';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Status Update - ${data.ref}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f4;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">

          <tr>
            <td style="background:#1a1a2e;padding:32px 28px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Order Status Update</h1>
              <p style="margin:8px 0 0;color:#aaa;font-size:14px;">${data.ref}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 16px;font-size:15px;color:#333;">
                Hi <strong>${data.clientName || 'Customer'}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                Your order <strong>${data.ref}</strong> status has been updated.
              </p>

              <div style="text-align:center;margin:24px 0;">
                <span style="display:inline-block;padding:12px 28px;border-radius:6px;background:${statusColor};color:#fff;font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                  ${statusLabel}
                </span>
              </div>

              <p style="margin:24px 0 0;font-size:14px;color:#777;line-height:1.6;text-align:center;">
                If you have any questions, reply to this email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f9f9f9;padding:20px 28px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:13px;color:#999;">
                Thank you for your order.
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
