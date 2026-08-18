import resend from "../config/email.js";

// ---------------------------------------------------------------------------
// Branding / shared layout
// ---------------------------------------------------------------------------
const APP_NAME = process.env.APP_NAME || "manageteam";
const LOGO_URL =
  process.env.EMAIL_LOGO_URL ||
  "https://res.cloudinary.com/dwhtiuoes/image/upload/v1787044902/brand/manageteam-email-logo.png";

const BRAND = "#84cc16"; // lime-500 — matches the "team" in the logo
const BRAND_INK = "#1a2e05"; // dark text that sits on top of the lime
const INK = "#111827";

const frontendUrl = () =>
  process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:5173";

export const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

// A lime primary button (email-safe, inline styles only).
const button = (href, label) => `
  <div style="text-align:center;margin:28px 0;">
    <a href="${href}" style="background:${BRAND};color:${BRAND_INK};padding:14px 32px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;font-size:15px;font-family:Arial,Helvetica,sans-serif;">
      ${label}
    </a>
  </div>`;

// Wraps every email in a consistent manageteam shell: logo header, the
// template's own content card, and a shared footer. `content` is the inner
// HTML (usually a coloured hero + white body card).
const emailLayout = ({ content, preheader = "" }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;-webkit-font-smoothing:antialiased;">
  ${
    preheader
      ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f3f4f6;">${preheader}</div>`
      : ""
  }
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:92%;">
          <tr>
            <td style="padding:6px 4px 18px 4px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="${LOGO_URL}" width="38" height="38" alt="${APP_NAME}" style="display:block;border:0;border-radius:8px;">
                  </td>
                  <td style="vertical-align:middle;padding-left:10px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;">
                    <span style="color:${INK};">manage</span><span style="color:${BRAND};">team</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>${content}</td>
          </tr>
          <tr>
            <td style="padding:22px 8px 4px 8px;font-family:Arial,Helvetica,sans-serif;">
              <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0;text-align:center;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br>
                You're receiving this email because you have an account on ${APP_NAME}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ---------------------------------------------------------------------------
// Transport — Resend
// ---------------------------------------------------------------------------
export const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  // Dry-run: capture the rendered email without sending. Handy for local
  // template previews and tests (EMAIL_DRY_RUN=1) — works without an API key.
  if (process.env.EMAIL_DRY_RUN === "1") {
    console.log(`🧪 [dry-run] ${subject} → ${to}`);
    return { dryRun: true, to, subject, html, text };
  }

  if (!resend) {
    console.log(`⚠️  Email skipped (Resend not configured): ${subject} → ${to}`);
    return null;
  }

  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || APP_NAME;

  if (!fromEmail) {
    console.error("❌ Cannot send email: SMTP_FROM not set!");
    return null;
  }

  try {
    console.log(`📤 Sending via Resend to ${to}...`);

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      console.error("❌ Resend response error:", JSON.stringify(error));
      throw new Error(error.message || "Resend send failed");
    }

    console.log(`✅ Email sent via Resend! ID: ${data?.id || "unknown"}`);
    return data;
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------
export const sendWelcomeEmail = async (to, name) => {
  const content = `
    <div style="background:${INK};padding:32px 30px;border-radius:12px 12px 0 0;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:26px;font-family:Arial,Helvetica,sans-serif;">Welcome to ${APP_NAME}! 🎉</h1>
    </div>
    <div style="background:#ffffff;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;font-family:Arial,Helvetica,sans-serif;">
      <h2 style="color:${INK};margin-top:0;">Hi ${escapeHtml(name)}! 👋</h2>
      <p style="color:#4b5563;font-size:16px;line-height:1.6;">
        Your account has been successfully created. We're excited to have you on board!
      </p>
      <p style="color:#4b5563;font-size:16px;line-height:1.6;">
        You can now log in and start tracking attendance, managing projects, and connecting with your team.
      </p>
      ${button(`${frontendUrl()}/Welcome`, "Login Now")}
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        If you have any questions, just reply to this email — we're here to help.
      </p>
    </div>`;

  return sendEmail({
    to,
    subject: `Welcome to ${APP_NAME}! 🎉`,
    preheader: "Your account is ready — log in and get started.",
    html: emailLayout({
      content,
      preheader: "Your account is ready — log in and get started.",
    }),
  });
};

export const sendCompanyInviteEmail = async (
  toEmail,
  fromAdminName,
  companyName,
  inviteLink,
  inviteCode,
) => {
  const content = `
    <div style="background:${INK};padding:30px;border-radius:12px 12px 0 0;text-align:center;">
      <p style="color:${BRAND};margin:0 0 8px 0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">${APP_NAME} Invitation</p>
      <h1 style="color:#ffffff;margin:0;font-size:26px;font-family:Arial,Helvetica,sans-serif;">Join ${escapeHtml(companyName)}</h1>
    </div>
    <div style="background:#ffffff;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;font-family:Arial,Helvetica,sans-serif;">
      <p style="color:${INK};font-size:16px;">Hi,</p>
      <p style="color:#4b5563;font-size:16px;line-height:1.6;">
        ${escapeHtml(fromAdminName)} invited you to join <strong>${escapeHtml(companyName)}</strong> on ${APP_NAME}, where your team manages attendance, leaves, projects, messages, and payroll in one place.
      </p>
      ${button(inviteLink, "Accept Invitation")}
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:18px;margin:22px 0;text-align:center;">
        <p style="color:#6b7280;margin:0 0 6px 0;font-size:13px;">Manual invite code</p>
        <p style="color:${INK};font-size:28px;letter-spacing:0.16em;font-weight:bold;margin:0;">${escapeHtml(inviteCode)}</p>
      </div>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        If the button does not work, open ${APP_NAME} and choose "Join Existing Company", then enter the code above.
      </p>
    </div>`;

  return sendEmail({
    to: toEmail,
    subject: `${fromAdminName} invited you to join ${companyName} on ${APP_NAME}`,
    preheader: `You've been invited to ${companyName}.`,
    html: emailLayout({
      content,
      preheader: `You've been invited to ${companyName}.`,
    }),
  });
};

export const sendPasswordResetEmail = async (to, resetLink) => {
  const content = `
    <div style="background:#ffffff;padding:30px;border:1px solid #e5e7eb;border-radius:12px;font-family:Arial,Helvetica,sans-serif;">
      <h1 style="color:${INK};margin-top:0;">Password Reset Request</h1>
      <p style="color:#4b5563;font-size:16px;">Click the button below to reset your password:</p>
      ${button(resetLink, "Reset Password")}
      <p style="color:#6b7280;font-size:14px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    </div>`;

  return sendEmail({
    to,
    subject: "Reset Your Password",
    preheader: "Reset your password — this link expires in 1 hour.",
    html: emailLayout({
      content,
      preheader: "Reset your password — this link expires in 1 hour.",
    }),
  });
};

export const sendFeedbackEmail = async ({ to, feedback, user }) => {
  const submittedAt = new Date(feedback.createdAt || Date.now()).toLocaleString();

  const content = `
    <div style="background:${INK};padding:28px;border-radius:12px 12px 0 0;font-family:Arial,Helvetica,sans-serif;">
      <p style="color:${BRAND};font-size:13px;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px 0;">${APP_NAME} Feedback</p>
      <h1 style="color:#ffffff;margin:0;font-size:24px;">${escapeHtml(feedback.subject)}</h1>
    </div>
    <div style="background:#ffffff;padding:28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;font-family:Arial,Helvetica,sans-serif;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:18px;">
        <tr><td style="color:#6b7280;padding:5px 0;">From</td><td style="color:${INK};font-weight:600;text-align:right;">${escapeHtml(user.full_name)} (${escapeHtml(user.email)})</td></tr>
        <tr><td style="color:#6b7280;padding:5px 0;">Category</td><td style="color:${INK};font-weight:600;text-align:right;text-transform:capitalize;">${escapeHtml(feedback.category)}</td></tr>
        <tr><td style="color:#6b7280;padding:5px 0;">Priority</td><td style="color:${INK};font-weight:600;text-align:right;text-transform:capitalize;">${escapeHtml(feedback.priority)}</td></tr>
        <tr><td style="color:#6b7280;padding:5px 0;">Rating</td><td style="color:${INK};font-weight:600;text-align:right;">${Number(feedback.rating || 0)}/5</td></tr>
        <tr><td style="color:#6b7280;padding:5px 0;">Submitted</td><td style="color:${INK};font-weight:600;text-align:right;">${escapeHtml(submittedAt)}</td></tr>
      </table>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:18px;margin:20px 0;">
        <p style="color:${INK};line-height:1.6;white-space:pre-wrap;margin:0;">${escapeHtml(feedback.message)}</p>
      </div>
      <p style="color:#4b5563;font-size:14px;">
        Contact allowed: <strong>${feedback.allow_contact ? "Yes" : "No"}</strong>
      </p>
      ${button(`${frontendUrl()}/Feedback`, "Open Feedback Inbox")}
    </div>`;

  return sendEmail({
    to,
    subject: `New feedback: ${feedback.subject}`,
    preheader: `New ${feedback.priority} feedback from ${user.full_name}.`,
    html: emailLayout({
      content,
      preheader: `New ${feedback.priority} feedback from ${user.full_name}.`,
    }),
  });
};

export const sendAutoCheckoutEmail = async (to, name, checkoutTime, workHours, idleHours) => {
  const content = `
    <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:30px;border-radius:12px 12px 0 0;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;font-family:Arial,Helvetica,sans-serif;">⏰ Auto Check-out</h1>
    </div>
    <div style="background:#ffffff;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;font-family:Arial,Helvetica,sans-serif;">
      <p style="color:${INK};font-size:16px;">Hi ${escapeHtml(name)},</p>
      <p style="color:#4b5563;font-size:16px;line-height:1.6;">
        We detected you were inactive for <strong>${idleHours} hours</strong>, so we automatically checked you out.
      </p>
      <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:20px 0;">
        <p style="margin:5px 0;color:#4b5563;"><strong>Check-out time:</strong> ${new Date(checkoutTime).toLocaleString()}</p>
        <p style="margin:5px 0;color:#4b5563;"><strong>Total hours worked:</strong> ${workHours} hrs</p>
      </div>
      <p style="color:#6b7280;font-size:14px;">
        Your check-out time is recorded as your last detected activity, not when the system noticed.
        If this was a mistake, please contact your administrator.
      </p>
    </div>`;

  return sendEmail({
    to,
    subject: "You were auto-checked out due to inactivity",
    preheader: "We checked you out after a period of inactivity.",
    html: emailLayout({
      content,
      preheader: "We checked you out after a period of inactivity.",
    }),
  });
};

export const sendAutoCheckoutWarningEmail = async (to, name, minutesLeft) => {
  const content = `
    <div style="background:#ffffff;padding:30px;border:1px solid #e5e7eb;border-radius:12px;font-family:Arial,Helvetica,sans-serif;">
      <h2 style="color:#f59e0b;margin-top:0;">⏰ Inactivity Warning</h2>
      <p style="color:${INK};">Hi ${escapeHtml(name)},</p>
      <p style="color:#4b5563;line-height:1.6;">
        You haven't been active for a while. To stay checked-in, just move your mouse or click anywhere in ${APP_NAME} within the next <strong>${minutesLeft} minutes</strong>.
      </p>
      <p style="color:#6b7280;font-size:14px;">
        Otherwise we'll automatically check you out using your last activity time.
      </p>
    </div>`;

  return sendEmail({
    to,
    subject: `⚠️ You will be auto-checked out in ${minutesLeft} minutes`,
    preheader: `Move your mouse in ${APP_NAME} to stay checked in.`,
    html: emailLayout({
      content,
      preheader: `Move your mouse in ${APP_NAME} to stay checked in.`,
    }),
  });
};

export const sendLeaveApprovalEmail = async (
  to,
  name,
  leaveType,
  startDate,
  endDate,
  status,
) => {
  const isApproved = status === "approved";
  const accent = isApproved ? "#10b981" : "#ef4444";

  const content = `
    <div style="background:#ffffff;padding:30px;border:1px solid #e5e7eb;border-radius:12px;font-family:Arial,Helvetica,sans-serif;">
      <h1 style="color:${accent};margin-top:0;">
        Your leave request has been ${escapeHtml(status)}
      </h1>
      <p style="color:#4b5563;font-size:16px;">Hi ${escapeHtml(name)},</p>
      <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:20px 0;">
        <p style="margin:5px 0;color:#4b5563;"><strong>Leave Type:</strong> ${escapeHtml(leaveType)}</p>
        <p style="margin:5px 0;color:#4b5563;"><strong>From:</strong> ${escapeHtml(startDate)}</p>
        <p style="margin:5px 0;color:#4b5563;"><strong>To:</strong> ${escapeHtml(endDate)}</p>
        <p style="margin:5px 0;color:#4b5563;"><strong>Status:</strong>
          <span style="color:${accent};font-weight:bold;text-transform:uppercase;">${escapeHtml(status)}</span>
        </p>
      </div>
      <p style="color:#6b7280;font-size:14px;">
        ${
          isApproved
            ? "Your leave has been added to the calendar. Enjoy your time off!"
            : "If you have questions, please contact your administrator."
        }
      </p>
    </div>`;

  return sendEmail({
    to,
    subject: `Leave Request ${isApproved ? "Approved ✅" : "Rejected ❌"}`,
    preheader: `Your ${leaveType} leave was ${status}.`,
    html: emailLayout({
      content,
      preheader: `Your ${leaveType} leave was ${status}.`,
    }),
  });
};

export const sendPayslipEmail = async (user, payslip, pdfUrl) => {
  const monthName = new Date(`${payslip.month}-01`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const symbol = payslip.currency_symbol || "₹";
  const fmt = (n) =>
    `${symbol}${Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const bonusRow =
    Number(payslip.bonus) > 0
      ? `<tr><td style="color:#4b5563;padding:4px 0;">Bonus</td><td style="text-align:right;color:${INK};font-weight:600;">${fmt(payslip.bonus)}</td></tr>`
      : "";
  const deductionsRow =
    Number(payslip.deductions) > 0
      ? `<tr><td style="color:#4b5563;padding:4px 0;">Deductions</td><td style="text-align:right;color:#dc2626;font-weight:600;">- ${fmt(payslip.deductions)}</td></tr>`
      : "";
  const notesBlock =
    payslip.notes && payslip.notes.trim()
      ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;margin:18px 0;">
            <p style="margin:0 0 6px 0;font-size:13px;color:#92400e;font-weight:bold;">Notes from Admin</p>
            <p style="margin:0;color:#78350f;font-size:14px;line-height:1.5;">${escapeHtml(payslip.notes)}</p>
         </div>`
      : "";

  const content = `
    <div style="background:linear-gradient(135deg,#a3d312,${BRAND});padding:30px;border-radius:12px 12px 0 0;text-align:center;">
      <h1 style="color:${BRAND_INK};margin:0;font-size:26px;font-family:Arial,Helvetica,sans-serif;">💰 Payslip — ${monthName}</h1>
      <p style="color:rgba(26,46,5,0.85);margin:8px 0 0 0;font-size:15px;font-family:Arial,Helvetica,sans-serif;">Your salary for ${monthName} is ready</p>
    </div>
    <div style="background:#ffffff;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;font-family:Arial,Helvetica,sans-serif;">
      <p style="color:${INK};font-size:16px;margin:0 0 8px 0;">Hi ${escapeHtml(user.full_name || payslip.employee_name)},</p>
      <p style="color:#4b5563;font-size:15px;line-height:1.6;">
        Your salary for <strong>${monthName}</strong> has been processed. The summary is below — your full payslip is attached as a PDF.
      </p>
      <div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:22px;margin:22px 0;text-align:center;">
        <p style="color:#6b7280;font-size:13px;margin:0 0 6px 0;letter-spacing:0.08em;">NET SALARY</p>
        <p style="color:#15803d;font-size:34px;font-weight:bold;margin:0;">${fmt(payslip.net_salary)}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:8px 0 18px 0;">
        <tr><td style="color:#4b5563;padding:4px 0;">Base Salary</td><td style="text-align:right;color:${INK};font-weight:600;">${fmt(payslip.base_salary)}</td></tr>
        ${bonusRow}
        ${deductionsRow}
      </table>
      ${notesBlock}
      ${button(pdfUrl, "📄 Download Payslip PDF")}
      <p style="color:#6b7280;font-size:13px;line-height:1.6;">
        If anything looks off, please reply to this email or contact your admin.
      </p>
    </div>`;

  return sendEmail({
    to: user.email,
    subject: `Your salary for ${monthName} is ready`,
    preheader: `Your ${monthName} payslip is ready to download.`,
    html: emailLayout({
      content,
      preheader: `Your ${monthName} payslip is ready to download.`,
    }),
  });
};

export const sendSalaryPaidEmail = async (
  to,
  employeeName,
  month,
  netSalary,
  paymentMethod,
  transactionId,
  paidDate,
  payslipUrl,
  currencySymbol = "₹",
) => {
  const monthName = new Date(`${month}-01`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const content = `
    <div style="background:linear-gradient(135deg,#10b981,#059669);padding:30px;border-radius:12px 12px 0 0;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:28px;font-family:Arial,Helvetica,sans-serif;">💰 Payment Received</h1>
      <p style="color:rgba(255,255,255,0.9);margin:10px 0 0 0;font-size:16px;font-family:Arial,Helvetica,sans-serif;">Your salary has been successfully credited</p>
    </div>
    <div style="background:#ffffff;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;font-family:Arial,Helvetica,sans-serif;">
      <p style="color:${INK};font-size:16px;">Hi ${escapeHtml(employeeName)},</p>
      <p style="color:#4b5563;font-size:16px;line-height:1.6;">
        We're pleased to inform you that your salary for <strong>${monthName}</strong> has been paid.
      </p>
      <div style="background:#f0fdf4;padding:25px;border-radius:12px;border:2px solid #bbf7d0;margin:20px 0;text-align:center;">
        <p style="color:#6b7280;font-size:14px;margin:0 0 10px 0;">NET SALARY</p>
        <p style="color:#10b981;font-size:36px;font-weight:bold;margin:0;">
          ${currencySymbol}${Number(netSalary || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
      <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:20px 0;">
        <h3 style="color:${INK};margin-top:0;">Payment Details:</h3>
        <p style="margin:10px 0;color:#4b5563;"><strong>Payment Method:</strong> ${escapeHtml(paymentMethod || "N/A")}</p>
        ${
          transactionId
            ? `<p style="margin:10px 0;color:#4b5563;"><strong>Transaction ID:</strong> ${escapeHtml(transactionId)}</p>`
            : ""
        }
        <p style="margin:10px 0;color:#4b5563;"><strong>Paid Date:</strong> ${new Date(paidDate).toLocaleDateString()}</p>
      </div>
      ${button(payslipUrl, "📄 Download Payslip")}
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        Your detailed payslip is available for download. It includes a complete breakdown of your earnings, deductions, and net salary.
      </p>
    </div>`;

  return sendEmail({
    to,
    subject: `Your Salary for ${monthName} has been Paid ✅`,
    preheader: `Your ${monthName} salary has been credited.`,
    html: emailLayout({
      content,
      preheader: `Your ${monthName} salary has been credited.`,
    }),
  });
};
