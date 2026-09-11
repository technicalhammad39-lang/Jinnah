import { EmailTemplate } from "./types";

/**
 * Replaces {{variable_name}} in HTML or plain text with given dictionary values.
 */
export function renderEmailTemplate(
  templateContent: string,
  variables: Record<string, string | number | undefined | null>
): string {
  let rendered = templateContent;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    rendered = rendered.replace(regex, value != null ? String(value) : "");
  }

  return rendered;
}

/**
 * Base email layout wrapper with modern luxury hardware aesthetic
 */
export function getBaseEmailLayout(contentHtml: string, previewText = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jinnah Hardware Store</title>
  <style>
    body { margin: 0; padding: 0; background-color: #faf9f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #11100e 0%, #1e1b18 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
    .header p { color: #E05A2B; margin: 6px 0 0 0; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
    .content { padding: 36px 28px; color: #2d2b27; line-height: 1.6; }
    .footer { background-color: #f4f2ee; padding: 24px; text-align: center; font-size: 11px; color: #787570; border-top: 1px solid rgba(0,0,0,0.05); }
    .btn { display: inline-block; background-color: #E05A2B; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 18px 0; }
    .badge { display: inline-block; background-color: rgba(224,90,43,0.1); color: #E05A2B; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .data-table { width: 100%; border-collapse: collapse; margin: 18px 0; }
    .data-table td { padding: 10px 0; border-bottom: 1px solid #f0eee9; font-size: 13px; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf9f6; padding: 30px 10px;">
    <tr>
      <td align="center">
        <div class="container">
          <div class="header">
            <div style="margin-bottom: 12px;">
              <img src="https://jinnah-hardwarestore.com/jinnah-logo.webp" alt="Jinnah Hardware Store" style="max-height: 52px; width: auto; display: inline-block; vertical-align: middle;" />
            </div>
            <h1>JINNAH HARDWARE STORE</h1>
            <p>Quality • Trust • Architectural Excellence</p>
          </div>
          <div class="content">
            ${contentHtml}
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px 0; font-weight: 600;">Jinnah Hardware Store • Bahawalpur Road, Hasilpur</p>
            <p style="margin: 0;">Phone: 0300-0421772 | Email: info@jinnah-hardwarestore.com</p>
            <p style="margin: 12px 0 0 0; font-size: 10px; color: #9c9993;">You received this email because of your transaction or inquiry with Jinnah Hardware.</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Pre-defined standard templates
 */
export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "tpl_order_placed",
    name: "Order Placed & Confirmation",
    slug: "order-placed",
    category: "order",
    subject: "Order Confirmed: #{{order_number}} - Jinnah Hardware Store",
    variables: ["customer_name", "order_number", "order_total", "tracking_url", "items_html", "shipping_address", "payment_method"],
    isDefault: true,
    createdAt: new Date().toISOString(),
    bodyHtml: getBaseEmailLayout(
      `
      <div style="text-align:center; margin-bottom:24px;">
        <span style="background-color:rgba(224,90,43,0.12); color:#E05A2B; font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; padding:6px 14px; border-radius:999px;">Order Received</span>
        <h2 style="margin:16px 0 8px 0; color:#11100e; font-size:24px; font-weight:900;">Thank You, {{customer_name}}!</h2>
        <p style="font-size:14px; color:#5c5852; max-width:440px; margin:0 auto;">
          Your order has been successfully placed. Our team is preparing your items for packaging and courier dispatch.
        </p>
      </div>

      <div style="background-color:#faf9f6; border-radius:14px; padding:20px; margin:24px 0; border:1px solid #ebe7e0;">
        <table width="100%">
          <tr>
            <td style="font-size:12px; color:#8a857d; text-transform:uppercase; font-weight:700;">Order ID</td>
            <td align="right" style="font-size:16px; font-family:monospace; font-weight:800; color:#11100e;">#{{order_number}}</td>
          </tr>
          <tr>
            <td style="font-size:12px; color:#8a857d; text-transform:uppercase; font-weight:700; padding-top:10px;">Payment Method</td>
            <td align="right" style="font-size:13px; font-weight:700; color:#11100e; padding-top:10px;">{{payment_method}}</td>
          </tr>
          <tr>
            <td style="font-size:12px; color:#8a857d; text-transform:uppercase; font-weight:700; padding-top:10px;">Delivery Address</td>
            <td align="right" style="font-size:13px; font-weight:600; color:#5c5852; padding-top:10px;">{{shipping_address}}</td>
          </tr>
          <tr>
            <td style="font-size:12px; color:#8a857d; text-transform:uppercase; font-weight:700; padding-top:10px;">Total Bill</td>
            <td align="right" style="font-size:18px; font-weight:900; color:#E05A2B; padding-top:10px;">Rs. {{order_total}}</td>
          </tr>
        </table>
      </div>

      {{items_html}}

      <div style="text-align:center; margin:32px 0 24px 0;">
        <a href="{{tracking_url}}" class="btn" style="box-shadow: 0 4px 14px rgba(224,90,43,0.35);">Track Live Order Status &rarr;</a>
        <p style="font-size:12px; color:#9c9993; margin-top:8px;">Check live tracking updates and dispatch status anytime.</p>
      </div>

      <div style="background-color:#fff; border:1px dashed #d6d2cb; border-radius:10px; padding:14px 18px; margin-top:20px;">
        <p style="margin:0; font-size:12px; color:#787570; text-align:center;">
          Need assistance or changes to your order? Contact WhatsApp support: <strong style="color:#11100e;">0300-0421772</strong>
        </p>
      </div>
      `,
      "Your order #{{order_number}} has been received successfully."
    ),
  },

  {
    id: "tpl_order_processing",
    name: "Order Processing & Verification",
    slug: "order-processing",
    category: "order",
    subject: "Order in Processing: #{{order_number}} - Jinnah Hardware Store",
    variables: ["customer_name", "order_number", "order_total", "tracking_url"],
    isDefault: false,
    createdAt: new Date().toISOString(),
    bodyHtml: getBaseEmailLayout(
      `
      <div style="text-align:center; margin-bottom:24px;">
        <span style="background-color:rgba(59,130,246,0.12); color:#2563eb; font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; padding:6px 14px; border-radius:999px;">Processing</span>
        <h2 style="margin:16px 0 8px 0; color:#11100e; font-size:24px; font-weight:900;">Order Verification in Progress</h2>
        <p style="font-size:14px; color:#5c5852; max-width:440px; margin:0 auto;">
          Dear {{customer_name}}, your order items have been verified from inventory and are currently undergoing quality inspection and packaging.
        </p>
      </div>

      <div style="text-align:center; margin:32px 0;">
        <a href="{{tracking_url}}" class="btn">View Live Tracking Status &rarr;</a>
      </div>
      `,
      "Your order is currently being packed and processed."
    ),
  },

  {
    id: "tpl_order_shipped",
    name: "Order Dispatched & In Transit",
    slug: "order-shipped",
    category: "order",
    subject: "Shipment Dispatched: #{{order_number}} via {{courier_name}}",
    variables: ["customer_name", "order_number", "courier_name", "tracking_number", "tracking_url", "order_total"],
    isDefault: true,
    createdAt: new Date().toISOString(),
    bodyHtml: getBaseEmailLayout(
      `
      <div style="text-align:center; margin-bottom:24px;">
        <span style="background-color:rgba(16,185,129,0.12); color:#059669; font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; padding:6px 14px; border-radius:999px;">Dispatched</span>
        <h2 style="margin:16px 0 8px 0; color:#11100e; font-size:24px; font-weight:900;">Your Package Has Been Dispatched!</h2>
        <p style="font-size:14px; color:#5c5852; max-width:440px; margin:0 auto;">
          Dear {{customer_name}}, your order has been handed over to our courier logistics partner and is en route to your delivery address.
        </p>
      </div>

      <div style="background-color:#faf9f6; border-radius:14px; padding:20px; margin:24px 0; border:1px solid #ebe7e0;">
        <table width="100%">
          <tr>
            <td style="font-size:12px; color:#8a857d; text-transform:uppercase; font-weight:700;">Order Reference</td>
            <td align="right" style="font-size:15px; font-family:monospace; font-weight:800; color:#11100e;">#{{order_number}}</td>
          </tr>
          <tr>
            <td style="font-size:12px; color:#8a857d; text-transform:uppercase; font-weight:700; padding-top:10px;">Courier Partner</td>
            <td align="right" style="font-size:14px; font-weight:700; color:#11100e; padding-top:10px;">{{courier_name}}</td>
          </tr>
          <tr>
            <td style="font-size:12px; color:#8a857d; text-transform:uppercase; font-weight:700; padding-top:10px;">Consignment # (CN)</td>
            <td align="right" style="font-size:15px; font-family:monospace; font-weight:900; color:#E05A2B; padding-top:10px;">{{tracking_number}}</td>
          </tr>
          <tr>
            <td style="font-size:12px; color:#8a857d; text-transform:uppercase; font-weight:700; padding-top:10px;">Payable Amount</td>
            <td align="right" style="font-size:16px; font-weight:800; color:#11100e; padding-top:10px;">Rs. {{order_total}}</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center; margin:32px 0 24px 0;">
        <a href="{{tracking_url}}" class="btn" style="box-shadow: 0 4px 14px rgba(224,90,43,0.35);">Live Courier Tracking &rarr;</a>
        <p style="font-size:12px; color:#9c9993; margin-top:8px;">Track courier movement and real-time transit status.</p>
      </div>

      <div style="background-color:#fff7ed; border:1px solid #fed7aa; border-radius:10px; padding:14px 18px;">
        <p style="margin:0; font-size:12px; color:#9a3412;">
          <strong>Helpful Tip:</strong> Please keep your phone available for the delivery courier rider call and have the exact payable amount ready if paying via Cash on Delivery.
        </p>
      </div>
      `,
      "Your shipment #{{order_number}} is on the way."
    ),
  },

  {
    id: "tpl_order_out_for_delivery",
    name: "Out For Delivery Alert",
    slug: "order-out-for-delivery",
    category: "order",
    subject: "Out for Delivery: #{{order_number}} Arriving Today!",
    variables: ["customer_name", "order_number", "tracking_url", "order_total"],
    isDefault: false,
    createdAt: new Date().toISOString(),
    bodyHtml: getBaseEmailLayout(
      `
      <div style="text-align:center; margin-bottom:24px;">
        <span style="background-color:rgba(234,179,8,0.15); color:#ca8a04; font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; padding:6px 14px; border-radius:999px;">Rider En Route</span>
        <h2 style="margin:16px 0 8px 0; color:#11100e; font-size:24px; font-weight:900;">Your Package is Out for Delivery Today!</h2>
        <p style="font-size:14px; color:#5c5852; max-width:440px; margin:0 auto;">
          Dear {{customer_name}}, our courier rider has departed with your order #{{order_number}} and will arrive at your address today.
        </p>
      </div>

      <div style="text-align:center; margin:32px 0;">
        <a href="{{tracking_url}}" class="btn">Track Rider & Order Status &rarr;</a>
      </div>
      `,
      "Your parcel is out for delivery today."
    ),
  },

  {
    id: "tpl_order_delivered",
    name: "Order Delivered Successfully",
    slug: "order-delivered",
    category: "order",
    subject: "Delivered: Order #{{order_number}} - Jinnah Hardware Store",
    variables: ["customer_name", "order_number", "tracking_url"],
    isDefault: true,
    createdAt: new Date().toISOString(),
    bodyHtml: getBaseEmailLayout(
      `
      <div style="text-align:center; margin-bottom:24px;">
        <span style="background-color:rgba(16,185,129,0.12); color:#059669; font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; padding:6px 14px; border-radius:999px;">Delivered</span>
        <h2 style="margin:16px 0 8px 0; color:#11100e; font-size:24px; font-weight:900;">Order Delivered Successfully!</h2>
        <p style="font-size:14px; color:#5c5852; max-width:440px; margin:0 auto;">
          Dear {{customer_name}}, your order #{{order_number}} has been delivered. Thank you for choosing Jinnah Hardware Store for your architectural hardware needs.
        </p>
      </div>

      <div style="text-align:center; margin:32px 0 24px 0;">
        <a href="{{tracking_url}}" class="btn">View Order Receipt &rarr;</a>
      </div>

      <p style="font-size:13px; color:#787570; text-align:center; margin-top:20px;">
        Your feedback is valuable to us. For any product warranty inquiries or support, our team is always here to help.
      </p>
      `,
      "Your order has been delivered successfully."
    ),
  },

  {
    id: "tpl_order_cancelled",
    name: "Order Cancellation Notice",
    slug: "order-cancelled",
    category: "order",
    subject: "Order Cancelled: #{{order_number}} - Jinnah Hardware Store",
    variables: ["customer_name", "order_number"],
    isDefault: false,
    createdAt: new Date().toISOString(),
    bodyHtml: getBaseEmailLayout(
      `
      <div style="text-align:center; margin-bottom:24px;">
        <span style="background-color:rgba(239,68,68,0.12); color:#dc2626; font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; padding:6px 14px; border-radius:999px;">Cancelled</span>
        <h2 style="margin:16px 0 8px 0; color:#11100e; font-size:24px; font-weight:900;">Order Cancellation Notice</h2>
        <p style="font-size:14px; color:#5c5852; max-width:440px; margin:0 auto;">
          Dear {{customer_name}}, your order #{{order_number}} has been cancelled.
        </p>
      </div>

      <p style="font-size:13px; color:#787570; text-align:center; margin-top:20px;">
        If you did not request this cancellation or would like to re-order, please contact our helpline at <strong>0300-0421772</strong>.
      </p>
      `,
      "Order cancellation notice."
    ),
  },

  {
    id: "tpl_contact_reply",
    name: "Contact Inquiry Response",
    slug: "contact-reply",
    category: "customer",
    subject: "Re: Your Inquiry with Jinnah Hardware Store",
    variables: ["customer_name", "custom_message", "support_phone"],
    isDefault: true,
    createdAt: new Date().toISOString(),
    bodyHtml: getBaseEmailLayout(
      `
      <h2 style="margin-top:0; color:#11100e; font-size:20px; font-weight:800;">Dear {{customer_name}},</h2>
      <p style="font-size:14px; color:#5c5852;">
        Thank you for contacting Jinnah Hardware Store. In response to your inquiry:
      </p>

      <div style="background-color:#faf9f6; border-left:4px solid #E05A2B; padding:18px 20px; margin:22px 0; border-radius:0 8px 8px 0;">
        <div style="font-size:14px; color:#2d2b27; line-height:1.7;">
          {{custom_message}}
        </div>
      </div>

      <p style="font-size:13px; color:#787570;">
        For further details, instant product rates, or bulk inquiries, you can also reach us directly at <strong>0300-0421772</strong>.
      </p>
      `,
      "Response from Jinnah Hardware Support Desk"
    ),
  },
];
