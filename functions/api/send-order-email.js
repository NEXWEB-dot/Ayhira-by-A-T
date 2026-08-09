/**
 * Cloudflare Pages Function
 * POST /api/send-order-email
 *
 * Receives the order details from checkout.html and sends two emails via
 * Resend: an order confirmation to the customer, and a notification to the
 * store owner. This runs server-side ONLY so the Resend API key is never
 * exposed to the browser.
 *
 * Required environment variables (set in Cloudflare Pages ->
 * Settings -> Environment variables):
 *   RESEND_API_KEY             - secret Resend API key (re_xxx...)
 *   RESEND_FROM_EMAIL          - verified sender, e.g. "Ayhira by A&T <orders@ayhiraclothing.com>"
 *   STORE_ADMIN_EMAIL          - the email address that should receive new-order notifications
 *   RESEND_CUSTOMER_TEMPLATE_ID - published Resend Template id for the customer confirmation
 *                                 (optional — falls back to inline HTML if not set)
 *   RESEND_ADMIN_TEMPLATE_ID    - published Resend Template id for the admin notification
 *                                 (optional — falls back to inline HTML if not set)
 *
 * NOTE: RESEND_FROM_EMAIL's domain must be verified in the Resend dashboard
 * before sending will work. Until then, Resend will reject the request.
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    const required = ["orderId", "customerName", "customerEmail", "items"];
    for (const field of required) {
      if (!data[field]) {
        return jsonResponse({ success: false, error: `Missing field: ${field}` }, 400);
      }
    }

    if (!env.RESEND_API_KEY) {
      return jsonResponse({ success: false, error: "RESEND_API_KEY is not configured" }, 500);
    }

    const fromAddress = env.RESEND_FROM_EMAIL || "Ayhira by A&T <orders@ayhiraclothing.com>";
    const adminEmail = env.STORE_ADMIN_EMAIL;

    // 3-column rows (Item | Qty | Price) — matches the Order Confirmation
    // template's table structure. This is passed as the ITEMS_HTML variable.
    const itemsRows = data.items
      .map(
        (item) => `
          <tr style="border-bottom:1px solid #f0e8de;">
            <td style="font-family:Arial,sans-serif;font-size:14px;color:#2A231E;padding:12px 12px;">${escapeHtml(item.name)}</td>
            <td style="font-family:Arial,sans-serif;font-size:14px;color:#6b5c4e;padding:12px 12px;text-align:center;">${escapeHtml(String(item.qty))}</td>
            <td style="font-family:Arial,sans-serif;font-size:14px;color:#2A231E;padding:12px 12px;text-align:right;font-weight:bold;">${escapeHtml(item.price)}</td>
          </tr>`
      )
      .join("");

    const shippingVal = data.shipping || "";
    const discountVal = data.discount || "Rs. 0";
    const totalVal = data.total || "";

    const sends = [];

    // ---- Customer confirmation email ----
    if (env.RESEND_CUSTOMER_TEMPLATE_ID) {
      sends.push(
        resendSend(env.RESEND_API_KEY, {
          from: fromAddress,
          to: [data.customerEmail],
          subject: `Order Confirmation - ${data.orderId}`,
          template: {
            id: env.RESEND_CUSTOMER_TEMPLATE_ID,
            variables: {
              CUSTOMER_NAME: data.customerName,
              ORDER_ID: data.orderId,
              ITEMS_HTML: itemsRows,
              SHIPPING: shippingVal,
              DISCOUNT: discountVal,
              TOTAL: totalVal,
            },
          },
        })
      );
    } else {
      // Fallback while the Resend Template isn't published/configured yet.
      const customerHtml = `
        <div style="font-family:Georgia,serif;color:#2A231E;max-width:520px;margin:0 auto;">
          <h2 style="font-weight:500;">Thank you for your order, ${escapeHtml(data.customerName)}!</h2>
          <p>We've received your order <strong>#${escapeHtml(data.orderId)}</strong> and it's being prepared.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsRows}</table>
          <p>Shipping: ${escapeHtml(shippingVal)} · Discount: ${escapeHtml(discountVal)} · Total: ${escapeHtml(totalVal)}</p>
          <p style="margin-top:24px;">We'll be in touch with delivery updates. Thank you for shopping with Ayhira by A&amp;T.</p>
        </div>`;

      sends.push(
        resendSend(env.RESEND_API_KEY, {
          from: fromAddress,
          to: [data.customerEmail],
          subject: `Order Confirmation - ${data.orderId}`,
          html: customerHtml,
        })
      );
    }

    // ---- Store owner notification email ----
    if (adminEmail) {
      if (env.RESEND_ADMIN_TEMPLATE_ID) {
        sends.push(
          resendSend(env.RESEND_API_KEY, {
            from: fromAddress,
            to: [adminEmail],
            reply_to: data.customerEmail,
            subject: `New Order - ${data.orderId}`,
            template: {
              id: env.RESEND_ADMIN_TEMPLATE_ID,
              variables: {
                CUSTOMER_NAME: data.customerName,
                CUSTOMER_EMAIL: data.customerEmail,
                ORDER_ID: data.orderId,
                PHONE: data.phone || "",
                ADDRESS: data.address || "",
                NOTES: data.notes || "None",
                ITEMS_HTML: itemsRows,
                SHIPPING: shippingVal,
                DISCOUNT: discountVal,
                TOTAL: totalVal,
              },
            },
          })
        );
      } else {
        const adminHtml = `
          <div style="font-family:Georgia,serif;color:#2A231E;max-width:520px;margin:0 auto;">
            <h2 style="font-weight:500;">New order #${escapeHtml(data.orderId)}</h2>
            <p><strong>Customer:</strong> ${escapeHtml(data.customerName)} (${escapeHtml(data.customerEmail)})</p>
            <p><strong>Phone:</strong> ${escapeHtml(data.phone || "")}</p>
            <p><strong>Address:</strong> ${escapeHtml(data.address || "")}</p>
            <p><strong>Notes:</strong> ${escapeHtml(data.notes || "None")}</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsRows}</table>
            <p>Shipping: ${escapeHtml(shippingVal)} · Discount: ${escapeHtml(discountVal)} · Total: ${escapeHtml(totalVal)}</p>
          </div>`;

        sends.push(
          resendSend(env.RESEND_API_KEY, {
            from: fromAddress,
            to: [adminEmail],
            reply_to: data.customerEmail,
            subject: `New Order - ${data.orderId}`,
            html: adminHtml,
          })
        );
      }
    }

    const results = await Promise.allSettled(sends);
    const failures = results.filter((r) => r.status === "rejected");

    if (failures.length > 0) {
      const errorDetails = failures
        .map((f) => (f.reason && f.reason.message) || String(f.reason))
        .join(" | ");
      console.warn("Some order emails failed to send:", errorDetails);
      return jsonResponse({ success: false, error: errorDetails }, 502);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error("send-order-email error:", err);
    return jsonResponse({ success: false, error: "Unexpected server error" }, 500);
  }
}

async function resendSend(apiKey, payload) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error (${res.status}): ${text}`);
  }

  return res.json();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
