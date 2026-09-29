// OTP emails ka branded HTML template.
// Email clients ke liye table layout + inline styles (external CSS support nahi karta).

const BRAND = "Store It Now";
const DOMAIN = "storeItNow.cloud";
const ACCENT = "#0078d4";
const ACCENT_DARK = "#106ebe";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const CONTENT = {
  verify: {
    subject: "Your Store It Now verification code",
    kicker: "Email verification",
    headline: "Verify your email address",
    body:
      "Use the code below to verify your email and activate your cloud storage account.",
    action: "Enter this code on the verification page",
  },
  reset: {
    subject: "Your Store It Now password reset code",
    kicker: "Password reset",
    headline: "Reset your password",
    body:
      "We received a request to reset the password for your Store It Now account. Use the code below to continue.",
    action: "Enter this code on the reset password page",
  },
};

/**
 * OTP email ka HTML body.
 * @param {object} opts
 * @param {string} opts.code      6-digit code
 * @param {string} [opts.purpose] "verify" | "reset"
 * @param {string} [opts.email]   jis address par mail ja raha hai
 * @param {number} [opts.expiryMinutes]
 */
const otpEmailHtml = ({
  code,
  purpose = "verify",
  email,
  expiryMinutes = 10,
}) => {
  const c = CONTENT[purpose] || CONTENT.verify;
  const safeEmail = email ? escapeHtml(email) : "";
  const safeCode = escapeHtml(code);

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#eef2f7;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef2f7" style="background-color:#eef2f7;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #e1e6ee;border-radius:14px;overflow:hidden;">
            <!-- Header -->
            <tr>
              <td bgcolor="${ACCENT}" style="background-color:${ACCENT};padding:20px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="middle" style="font-size:20px;line-height:1;">&#9729;&#65039;</td>
                    <td valign="middle" style="padding-left:10px;color:#ffffff;font-size:16px;font-weight:700;letter-spacing:.4px;">
                      ${BRAND}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:34px 32px 10px 32px;">
                <p style="margin:0 0 10px 0;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${ACCENT};">
                  ${c.kicker}
                </p>
                <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.3;color:#141926;">
                  ${c.headline}
                </h1>
                <p style="margin:0;font-size:14.5px;line-height:1.65;color:#4a5568;">
                  ${c.body}
                </p>
              </td>
            </tr>

            <!-- Code -->
            <tr>
              <td style="padding:18px 32px 6px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" bgcolor="#eff6fc" style="background-color:#eff6fc;border:1px dashed #b9d7f2;border-radius:12px;padding:26px 16px;">
                      <div style="font-size:12px;color:#5b6b82;letter-spacing:.5px;margin-bottom:10px;">
                        ${c.action}
                      </div>
                      <div style="font-family:Consolas,'Courier New',monospace;font-size:40px;font-weight:700;letter-spacing:12px;color:#0b3a68;padding-left:12px;">
                        ${safeCode}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Expiry -->
            <tr>
              <td align="center" style="padding:14px 32px 4px 32px;">
                <p style="margin:0;font-size:13px;color:#6b7280;">
                  This code expires in <strong style="color:#141926;">${expiryMinutes} minutes</strong>.
                  If it has expired, request a new one.
                </p>
              </td>
            </tr>

            <!-- Security note -->
            <tr>
              <td style="padding:18px 32px 8px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td bgcolor="#fff8e1" style="background-color:#fff8e1;border-left:4px solid #f7c948;padding:12px 16px;border-radius:6px;">
                      <p style="margin:0;font-size:12.5px;line-height:1.6;color:#6b5a00;">
                        <strong>Didn&#39;t request this?</strong>
                        You can safely ignore this email &mdash; your password and account stay unchanged.
                        Never share this code with anyone; our team will never ask for it.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px 30px 32px;">
                <p style="margin:0;font-size:12px;line-height:1.7;color:#8b95a5;border-top:1px solid #eef1f6;padding-top:16px;">
                  Sent to <strong style="color:#4a5568;">${safeEmail}</strong><br/>
                  &copy; 2026 ${BRAND} &middot; ${DOMAIN} &middot; Secure cloud storage for your files.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

// Text fallback (HTML block ho to ye dikhta hai)
const otpEmailText = ({
  code,
  purpose = "verify",
  email,
  expiryMinutes = 10,
}) => {
  const c = CONTENT[purpose] || CONTENT.verify;

  return [
    c.headline,
    "",
    c.body,
    "",
    `Your code: ${code}`,
    `Valid for ${expiryMinutes} minutes.`,
    "",
    `Didn't request this? Ignore this email — nothing changes for ${email || "your account"}.`,
    "",
    `— ${BRAND}`,
  ].join("\n");
};

const otpSubject = (purpose = "verify") =>
  (CONTENT[purpose] || CONTENT.verify).subject;

module.exports = { otpEmailHtml, otpEmailText, otpSubject };
