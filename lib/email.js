import nodemailer from 'nodemailer';

// Persist OTP store on globalThis so it survives Next.js HMR reloads
if (!globalThis._otpStore) {
    globalThis._otpStore = new Map();
}
const otpStore = globalThis._otpStore;
const OTP_EXPIRY_MS = 120 * 1000; // 120 seconds

/**
 * Generate a 6-digit OTP
 */
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP for an email
 */
export function storeOtp(email, otp) {
    otpStore.set(email.toLowerCase(), {
        otp,
        expiresAt: Date.now() + OTP_EXPIRY_MS
    });
}

/**
 * Verify OTP for an email
 * @returns {boolean} true if OTP is valid
 */
export function verifyOtp(email, otp) {
    const entry = otpStore.get(email.toLowerCase());
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
        otpStore.delete(email.toLowerCase());
        return false;
    }
    if (entry.otp !== otp) return false;
    // OTP used — remove it
    otpStore.delete(email.toLowerCase());
    return true;
}

/**
 * Send OTP verification email
 */
export async function sendOtpEmail(toEmail, otp) {
    const transporter = createTransporter();
    const fromEmail = process.env.SMTP_USER;

    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);border-radius:12px 12px 0 0;padding:30px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;">📓 Online Clipboard</h1>
                <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Email Verification</p>
            </div>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:30px;border-radius:0 0 12px 12px;text-align:center;">
                <h2 style="margin:0 0 8px;font-size:18px;color:#1e3a8a;">Your Verification Code</h2>
                <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Enter this code to verify your email and create your account.</p>
                <div style="background:#eff6ff;border:3px dashed #3b82f6;border-radius:12px;padding:20px;margin:0 auto;max-width:250px;">
                    <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:700;color:#1e3a8a;letter-spacing:8px;">${otp}</span>
                </div>
                <p style="color:#94a3b8;font-size:12px;margin:20px 0 0;">This code expires in 2 minutes. If you didn't request this, ignore this email.</p>
            </div>
            <div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">
                <p style="margin:0;">Sent via Online Clipboard • Do not reply to this email</p>
            </div>
        </div>
    </body>
    </html>`;

    const mailOptions = {
        from: `"Online Clipboard" <${fromEmail}>`,
        to: toEmail,
        subject: `🔐 Your Verification Code — Online Clipboard`,
        html: htmlBody
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
}

export { generateOtp };

function createTransporter() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);

    if (!host || !user || !pass) {
        throw new Error('SMTP configuration missing. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env.local');
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });
}

/**
 * Send clipboard content + file attachments to an email
 * @param {string} toEmail - Recipient email
 * @param {string} clipboardId - The clipboard ID for reference
 * @param {string} clipboardContent - Text content of the clipboard
 * @param {Array<{filename: string, content: Buffer, contentType: string}>} attachments - File attachments
 */
export async function sendClipboardEmail(toEmail, clipboardId, clipboardContent, attachments = []) {
    const transporter = createTransporter();
    const fromEmail = process.env.SMTP_USER;

    const hasText = clipboardContent && clipboardContent.trim().length > 0;
    const hasFiles = attachments.length > 0;

    // Build HTML email body
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);border-radius:12px 12px 0 0;padding:30px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;">📓 Online Clipboard</h1>
                <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Clipboard content delivered to your inbox</p>
            </div>

            <!-- Body -->
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:30px;border-radius:0 0 12px 12px;">
                <!-- Clipboard ID Badge -->
                <div style="text-align:center;margin-bottom:24px;">
                    <span style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:8px;padding:8px 16px;font-size:14px;color:#1e40af;font-weight:600;">
                        Clipboard ID: ${clipboardId}
                    </span>
                </div>

                ${hasText ? `
                <!-- Text Content -->
                <div style="margin-bottom:24px;">
                    <h2 style="margin:0 0 12px;font-size:16px;color:#1e3a8a;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">📝 Text Content</h2>
                    <div style="background:#fefce8;border:2px solid #fde047;border-radius:8px;padding:16px;white-space:pre-wrap;font-family:'Courier New',monospace;font-size:14px;color:#1e3a8a;line-height:1.6;">
${clipboardContent}
                    </div>
                </div>
                ` : ''}

                ${hasFiles ? `
                <!-- Files -->
                <div style="margin-bottom:24px;">
                    <h2 style="margin:0 0 12px;font-size:16px;color:#1e3a8a;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">📎 Attached Files (${attachments.length})</h2>
                    <p style="color:#64748b;font-size:13px;margin:0;">The files from this clipboard are attached to this email.</p>
                </div>
                ` : ''}

                ${!hasText && !hasFiles ? `
                <div style="text-align:center;padding:20px;color:#94a3b8;">
                    <p style="font-size:16px;margin:0;">This clipboard was empty.</p>
                </div>
                ` : ''}
            </div>

            <!-- Footer -->
            <div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">
                <p style="margin:0;">Sent via Online Clipboard • Do not reply to this email</p>
            </div>
        </div>
    </body>
    </html>`;

    const mailOptions = {
        from: `"Online Clipboard" <${fromEmail}>`,
        to: toEmail,
        subject: `📓 Clipboard [${clipboardId}] — Content Delivery`,
        html: htmlBody,
        attachments: attachments.map(att => ({
            filename: att.filename,
            content: att.content,
            contentType: att.contentType
        }))
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
}
