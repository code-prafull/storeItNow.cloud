const nodemailer = require("nodemailer");
const dns = require("node:dns");

const SMTP_HOST = "smtp.gmail.com";
const SMTP_USER = process.env.EMAIL_USER;
const SMTP_PASS = process.env.EMAIL_PASS;

// Render jaise hosts par IPv6 route nahi hota. nodemailer hostname resolve karke
// addresses me se EK random pick karta hai — agar woh IPv6 hua to ENETUNREACH.
// Isliye hum khud IPv4 nikaal kar seedha us IP par connect karte hain, aur fail
// hone par hostname/STARTTLS wale alternates try karte hain.
const TIMEOUTS = {
  connectionTimeout: 6000,
  greetingTimeout: 5000,
  socketTimeout: 20000,
};

async function resolveIPv4() {
  try {
    const addrs = await dns.promises.resolve4(SMTP_HOST);
    if (Array.isArray(addrs) && addrs.length) return addrs;
    console.warn("[email] resolve4 returned no addresses");
  } catch (err) {
    console.warn("[email] resolve4 failed:", err.code || err.message);
  }
  return [];
}

async function buildStrategies() {
  const ipv4 = await resolveIPv4();
  if (ipv4.length) console.log("[email] IPv4 candidates:", ipv4.join(", "));

  const strategies = [];
  if (ipv4.length) {
    // servername = TLS SNI/certificate check ke liye hostname, warna Gmail ka
    // certificate IP literal par reject ho jayega.
    strategies.push({
      label: `${ipv4[0]}:465 implicit-TLS`,
      options: { host: ipv4[0], port: 465, secure: true, servername: SMTP_HOST },
    });
    strategies.push({
      label: `${ipv4[0]}:587 STARTTLS`,
      options: { host: ipv4[0], port: 587, secure: false, requireTLS: true, servername: SMTP_HOST },
    });
  }
  strategies.push({
    label: `${SMTP_HOST}:465 (dns)`,
    options: { host: SMTP_HOST, port: 465, secure: true },
  });
  strategies.push({
    label: `${SMTP_HOST}:587 STARTTLS (dns)`,
    options: { host: SMTP_HOST, port: 587, secure: false, requireTLS: true },
  });
  return strategies;
}

const sendEmail = async (to, subject, text, html) => {
  const message = {
    from: `"Store It Now" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  };

  const strategies = await buildStrategies();
  const failures = [];

  for (const strategy of strategies) {
    const transport = nodemailer.createTransport({
      ...strategy.options,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      ...TIMEOUTS,
    });

    try {
      await transport.sendMail(message);
      if (typeof transport.close === "function") transport.close();
      console.log(`[email] OTP mail sent via ${strategy.label}`);
      return;
    } catch (err) {
      if (typeof transport.close === "function") transport.close();
      failures.push(`${strategy.label} -> ${err.code || err.message}`);
      console.warn(`[email] ${strategy.label} failed:`, err.code || err.message);
    }
  }

  const error = new Error(`All SMTP strategies failed (${failures.join(" | ")})`);
  error.code = "EEMAILALL";
  throw error;
};

module.exports = sendEmail;
