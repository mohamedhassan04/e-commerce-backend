import { formatPrice } from 'src/shared/utils/utils';

export function getOrderEmailTemplate(data: any) {
  const itemRows = (data.items || [])
    .map(
      (item: any) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-weight:600;">${item.productName}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;">${formatPrice(item.priceTTC)}</td>
      </tr>`,
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation - ${data.ref}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f4;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">

          <tr>
            <td style="background:#1a1a2e;padding:32px 28px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Order Confirmation</h1>
              <p style="margin:8px 0 0;color:#aaa;font-size:14px;">${data.ref}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 16px;font-size:15px;color:#333;">
                Hi <strong>${data.clientName || 'Customer'}</strong>,
              </p>
              <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.6;">
                Thank you for your order! Here's a summary of your purchase.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border:1px solid #eee;border-radius:8px;overflow:hidden;">
                <thead>
                  <tr style="background:#1a1a2e;">
                    <th style="padding:10px 12px;text-align:left;color:#fff;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Product</th>
                    <th style="padding:10px 12px;text-align:center;color:#fff;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Qty</th>
                    <th style="padding:10px 12px;text-align:right;color:#fff;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:20px;">
                <tr>
                  <td style="padding:12px 0;border-top:2px solid #1a1a2e;font-size:16px;font-weight:700;color:#1a1a2e;">
                    Total
                  </td>
                  <td style="padding:12px 0;border-top:2px solid #1a1a2e;text-align:right;font-size:18px;font-weight:700;color:#1a1a2e;">
                    ${formatPrice(data.totalTTC)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:#f9f9f9;padding:20px 28px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:13px;color:#999;">
                If you have any questions, reply to this email.
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
