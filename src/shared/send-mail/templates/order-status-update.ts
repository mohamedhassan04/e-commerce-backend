import { renderEmailLayout } from './email-layout';

const STATUS_LABELS: Record<string, { en: string; cz: string }> = {
  PENDING: { en: 'Pending', cz: 'Čeká na vyřízení' },
  CONFIRMED: { en: 'Confirmed', cz: 'Potvrzeno' },
  SHIPPED: { en: 'Shipped', cz: 'Odesláno' },
  DELIVERED: { en: 'Delivered', cz: 'Doručeno' },
  CANCELLED: { en: 'Cancelled', cz: 'Zrušeno' },
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#c96d33',
  CONFIRMED: '#3c5243',
  SHIPPED: '#3c5243',
  DELIVERED: '#1d3124',
  CANCELLED: '#66766c',
};

export interface OrderStatusUpdateEmailData {
  language?: 'cz' | 'en';
  ref: string;
  clientName: string;
  status: string;
}

export function getOrderStatusUpdateTemplate(data: OrderStatusUpdateEmailData) {
  const language = data.language ?? 'en';
  const isCzech = language === 'cz';
  const copy = isCzech
    ? {
        eyebrow: `OBJEDNÁVKA ${data.ref}`,
        title: 'Změna stavu objednávky',
        greeting: 'Dobrý den',
        customer: 'zákazníku',
        message: 'Stav vaší objednávky byl aktualizován.',
        questions: 'Potřebujete poradit? Odpovězte na tento e-mail.',
      }
    : {
        eyebrow: `ORDER ${data.ref}`,
        title: 'An update on your order',
        greeting: 'Hello',
        customer: 'Customer',
        message: 'The status of your order has been updated.',
        questions: 'Need a hand? Just reply to this email.',
      };
  const statusLabel = STATUS_LABELS[data.status]?.[language] ?? data.status;
  const statusColor = STATUS_COLORS[data.status] ?? '#3c5243';
  const content = `
    <p style="margin:0 0 10px;color:#1d3124;font-size:16px;line-height:1.6;">${copy.greeting} <strong>${data.clientName || copy.customer}</strong>,</p>
    <p style="margin:0 0 24px;color:#66766c;font-size:15px;line-height:1.7;">${copy.message}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #dce4dc;border-radius:12px;background:#e2ece5;">
      <tr>
        <td align="center" style="padding:25px 20px;">
          <p style="margin:0 0 12px;color:#66766c;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">${data.ref}</p>
          <span style="display:inline-block;padding:11px 19px;border-radius:999px;background:${statusColor};color:#fff;font-size:13px;font-weight:700;letter-spacing:0.6px;">${statusLabel}</span>
        </td>
      </tr>
    </table>
    <p style="margin:24px 0 0;padding-top:18px;border-top:1px solid #e5e7dc;color:#66766c;font-size:13px;line-height:1.6;">${copy.questions}</p>`;

  return renderEmailLayout({
    language,
    eyebrow: copy.eyebrow,
    title: copy.title,
    content,
  });
}
