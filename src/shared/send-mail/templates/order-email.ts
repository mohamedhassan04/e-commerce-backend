import { formatPrice } from 'src/shared/utils/utils';
import { renderEmailLayout } from './email-layout';

export interface OrderEmailData {
  language?: 'cz' | 'en';
  ref: string;
  clientName: string;
  items: {
    productName: string;
    quantity: number;
    priceTTC: number;
    originalPriceTTC?: number | null;
  }[];
  totalTTC: number;
  savings?: number;
}

export function getOrderEmailTemplate(data: OrderEmailData) {
  const language = data.language ?? 'en';
  const isCzech = language === 'cz';
  const copy = isCzech
    ? {
        eyebrow: `OBJEDNÁVKA ${data.ref}`,
        title: 'Děkujeme za vaši objednávku',
        greeting: 'Dobrý den',
        customer: 'zákazníku',
        intro: 'Vaši objednávku jsme přijali. Níže najdete její přehled.',
        product: 'Produkt',
        quantity: 'Počet',
        total: 'Celkem',
        discount: 'Uplatněná sleva',
        questions: 'Potřebujete poradit? Odpovězte na tento e-mail.',
      }
    : {
        eyebrow: `ORDER ${data.ref}`,
        title: 'Thank you for your order',
        greeting: 'Hello',
        customer: 'Customer',
        intro: 'We have received your order. Here is a summary for your records.',
        product: 'Product',
        quantity: 'Qty',
        total: 'Total',
        discount: 'Discount applied',
        questions: 'Need a hand? Just reply to this email.',
      };

  const itemRows = (data.items || [])
    .map((item, index) => {
      const original = item.originalPriceTTC;
      const formattedPrice =
        original != null && Number(original) > Number(item.priceTTC)
          ? `<span style="color:#66766c;text-decoration:line-through;font-weight:400;">${formatPrice(original)}</span><br/><strong style="color:#1d3124;">${formatPrice(item.priceTTC)}</strong>`
          : `<strong style="color:#1d3124;">${formatPrice(item.priceTTC)}</strong>`;

      return `
        <tr style="background:${index % 2 === 0 ? '#faf9f1' : '#f3f3e9'};">
          <td style="padding:14px 12px;border-bottom:1px solid #e5e7dc;color:#1d3124;font-size:14px;font-weight:600;">${item.productName}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #e5e7dc;color:#66766c;font-size:14px;text-align:center;">${item.quantity}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #e5e7dc;font-size:14px;text-align:right;white-space:nowrap;">${formattedPrice}</td>
        </tr>`;
    })
    .join('');

  const savings =
    data.savings != null && Number(data.savings) > 0 ? Number(data.savings) : 0;
  const savingsRow = savings
    ? `<tr>
        <td style="padding:14px 12px;color:#3c5243;font-size:13px;font-weight:600;">${copy.discount}</td>
        <td style="padding:14px 12px;color:#3c5243;font-size:13px;text-align:right;white-space:nowrap;">-${formatPrice(savings)}</td>
      </tr>`
    : '';

  const content = `
    <p style="margin:0 0 10px;color:#1d3124;font-size:16px;line-height:1.6;">${copy.greeting} <strong>${data.clientName || copy.customer}</strong>,</p>
    <p style="margin:0 0 24px;color:#66766c;font-size:15px;line-height:1.7;">${copy.intro}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px;border:1px solid #dce4dc;border-radius:12px;border-spacing:0;overflow:hidden;">
      <thead>
        <tr style="background:#e2ece5;">
          <th style="padding:11px 12px;color:#3c5243;font-size:10px;text-align:left;text-transform:uppercase;letter-spacing:1.2px;">${copy.product}</th>
          <th style="padding:11px 12px;color:#3c5243;font-size:10px;text-align:center;text-transform:uppercase;letter-spacing:1.2px;">${copy.quantity}</th>
          <th style="padding:11px 12px;color:#3c5243;font-size:10px;text-align:right;text-transform:uppercase;letter-spacing:1.2px;">${copy.total}</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-spacing:0;">
      ${savingsRow}
      <tr>
        <td style="padding:17px 12px;border-top:2px solid #1d3124;color:#14231a;font-family:Georgia,'Times New Roman',serif;font-size:19px;font-weight:700;">${copy.total}</td>
        <td style="padding:17px 12px;border-top:2px solid #1d3124;color:#14231a;font-size:20px;font-weight:700;text-align:right;white-space:nowrap;">${formatPrice(data.totalTTC)}</td>
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
