import { EmailSettings } from "./types";
import { sendEmailViaSmtp } from "./smtp";
import { DEFAULT_TEMPLATES, renderEmailTemplate } from "./templates";
import { getStoredEmailSettings, saveEmailMessageDoc } from "./db";

/**
 * Loads EmailSettings from Firestore with automatic Admin/Client SDK fallback.
 */
export async function getEmailSettings(): Promise<EmailSettings | null> {
  return getStoredEmailSettings();
}

/**
 * Handles Contact Form submissions:
 * 1. Creates an email conversation in the Inbox folder so admin can read and reply directly.
 * 2. If SMTP is configured, sends an immediate professional auto-acknowledgement.
 */
export async function handleContactFormSubmission(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  try {
    const convId = `contact-${Date.now()}`;
    const subject = data.subject || `Inquiry from ${data.name}`;

    // 1. Create message in Inbox
    await saveEmailMessageDoc({
      folder: "inbox",
      conversationId: convId,
      from: {
        name: data.name,
        email: data.email,
      },
      to: [{ name: "Support Desk", email: "info@jinnah-hardwarestore.com" }],
      subject: `[Website Inquiry] ${subject}`,
      bodyHtml: `
        <div style="font-family:sans-serif; line-height:1.6;">
          <h3 style="color:#11100e;">New Contact Form Message</h3>
          <p><strong>Customer:</strong> ${data.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
          <hr style="border:none; border-top:1px solid #eee; margin:15px 0;" />
          <p style="white-space:pre-wrap;">${data.message}</p>
        </div>
      `,
      bodyText: `Customer: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || ""}\n\n${data.message}`,
      snippet: data.message.slice(0, 140),
      isRead: false,
      isStarred: false,
      isImportant: true,
      hasAttachments: false,
      status: "received",
      createdAt: new Date().toISOString(),
    });

    // 2. Dispatch auto-reply if SMTP is enabled
    const settings = await getEmailSettings();
    if (settings && settings.smtpEnabled) {
      const template = DEFAULT_TEMPLATES.find((t) => t.slug === "contact-reply");
      if (template) {
        const replyHtml = renderEmailTemplate(template.bodyHtml, {
          customer_name: data.name,
          custom_message:
            "Aapka inquiry message humein mil chuka hai. Hamari team jald az jald aapke sawalat ka jawab provide karegi.",
          support_phone: "0300-0421772",
        });

        await sendEmailViaSmtp({
          settings,
          to: data.email,
          subject: `Re: ${subject} - Jinnah Hardware Store`,
          html: replyHtml,
          conversationId: convId,
        });
      }
    }
  } catch (error) {
    console.error("[Contact Form Email Automation Error]:", error);
  }
}

/**
 * Dispatches automated transactional emails on order status changes.
 */
/**
 * Dispatches automated transactional emails on order status changes.
 */
export async function handleOrderStatusEmail(order: any, newStatus: string) {
  const customerEmail = order.customerInfo?.email || order.customer?.email;
  if (!customerEmail) return;

  const settings = await getEmailSettings();
  if (!settings || !settings.smtpEnabled) return;

  try {
    const customerName = `${order.customerInfo?.firstName || ""} ${order.customerInfo?.lastName || ""}`.trim() || order.customer?.name || "Customer";
    const orderNumber = order.id || "JH-ORDER";
    const baseUrl = (process.env.APP_URL || "https://jinnah-hardwarestore.com").replace(/\/$/, "");
    const trackingUrl = `${baseUrl}/track-order/${orderNumber}`;
    const orderTotal = (order.total || 0).toLocaleString();

    let templateSlug = "";
    let emailSubject = "";

    if (newStatus === "pending") {
      templateSlug = "order-placed";
      emailSubject = `Order Confirmed: #${orderNumber} - Jinnah Hardware Store`;
    } else if (newStatus === "processing") {
      templateSlug = "order-processing";
      emailSubject = `Order in Processing: #${orderNumber} - Jinnah Hardware Store`;
    } else if (newStatus === "shipped") {
      templateSlug = "order-shipped";
      emailSubject = `Shipment Dispatched: #${orderNumber} via ${order.courierName || "Express Courier"}`;
    } else if (newStatus === "out_for_delivery") {
      templateSlug = "order-out-for-delivery";
      emailSubject = `Out for Delivery: #${orderNumber} Arriving Today!`;
    } else if (newStatus === "delivered") {
      templateSlug = "order-delivered";
      emailSubject = `Delivered: Order #${orderNumber} - Jinnah Hardware Store`;
    } else if (newStatus === "cancelled") {
      templateSlug = "order-cancelled";
      emailSubject = `Order Cancelled: #${orderNumber} - Jinnah Hardware Store`;
    }

    if (!templateSlug) return;

    const template = DEFAULT_TEMPLATES.find((t) => t.slug === templateSlug);
    if (!template) return;

    // Render items table HTML if available
    let itemsHtml = "";
    if (Array.isArray(order.items) && order.items.length > 0) {
      const rows = order.items
        .map((item: any) => {
          const name = item.name || item.product?.name || "Hardware Item";
          const qty = item.quantity || 1;
          const price = (item.price || item.product?.price || 0).toLocaleString();
          return `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0eee9; font-size: 13px; color: #11100e;">
                <strong>${name}</strong>
              </td>
              <td align="center" style="padding: 10px 0; border-bottom: 1px solid #f0eee9; font-size: 13px; color: #787570;">
                x${qty}
              </td>
              <td align="right" style="padding: 10px 0; border-bottom: 1px solid #f0eee9; font-size: 13px; font-weight: 700; color: #11100e;">
                Rs. ${price}
              </td>
            </tr>
          `;
        })
        .join("");

      itemsHtml = `
        <div style="margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; color: #8a857d; font-weight: 700;">Order Items</h4>
          <table width="100%" style="border-collapse: collapse;">
            ${rows}
          </table>
        </div>
      `;
    }

    const shippingAddress = order.customerInfo?.address
      ? `${order.customerInfo.address}, ${order.customerInfo.city || ""}`
      : "Not specified";

    const paymentMethod = order.paymentMethod
      ? order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod
      : "Cash on Delivery";

    const renderedHtml = renderEmailTemplate(template.bodyHtml, {
      customer_name: customerName,
      order_number: orderNumber,
      order_total: orderTotal,
      courier_name: order.courierName || "Express Logistics",
      tracking_number: order.trackingNumber || "Pending Courier Scan",
      tracking_url: trackingUrl,
      items_html: itemsHtml,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
    });

    await sendEmailViaSmtp({
      settings,
      to: customerEmail,
      subject: emailSubject,
      html: renderedHtml,
      conversationId: `order-${orderNumber}`,
    });
  } catch (error) {
    console.error("[Order Status Email Automation Error]:", error);
  }
}
