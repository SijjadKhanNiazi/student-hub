import nodemailer from "nodemailer";

let cachedTransporter = null;

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getFromAddress() {
  const raw = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const name = process.env.EMAIL_FROM_NAME || "Mianwali Students Hub";
  if (isValidEmail(raw)) {
    return `${name} <${raw}>`;
  }
  if (isValidEmail(process.env.EMAIL_USER)) {
    return `${name} <${process.env.EMAIL_USER}>`;
  }
  return name;
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT || 465);
  const secure = process.env.EMAIL_SECURE
    ? process.env.EMAIL_SECURE === "true"
    : port === 465;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn(
      "[email] EMAIL_USER / EMAIL_PASS are not set — emails will be skipped.",
    );
    cachedTransporter = null;
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return cachedTransporter;
}

export async function sendEmail({ to, subject, text, html, from }) {
  const transporter = getTransporter();
  if (!transporter) return { skipped: true, reason: "not_configured" };
  if (!isValidEmail(to)) return { skipped: true, reason: "invalid_to" };

  const message = {
    from: from || getFromAddress(),
    to,
    subject,
  };
  if (html) message.html = html;
  if (text) message.text = text;
  if (!message.text && !message.html) {
    return { skipped: true, reason: "no_body" };
  }

  try {
    const info = await transporter.sendMail(message);
    return { success: true, info };
  } catch (err) {
    console.error("[email] failed to send to", to, err);
    throw err;
  }
}

export { isValidEmail, getFromAddress };
