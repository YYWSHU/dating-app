import nodemailer from 'nodemailer';

// Dev mode: use Ethereal test SMTP. Production: set real SMTP in .env
let transporter: nodemailer.Transporter;

async function initTransporter() {
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Dev fallback: Ethereal fake SMTP or just log to console
    console.log('[EMAIL] No SMTP configured, emails will be logged to console');
    transporter = {
      sendMail: async (opts: any) => {
        console.log(`[EMAIL] To: ${opts.to}, Subject: ${opts.subject}`);
        console.log(`[EMAIL] Body: ${opts.text?.substring(0, 200)}`);
        return { messageId: `dev-${Date.now()}` };
      },
    } as any;
  }
}

initTransporter();

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

export async function sendVerificationEmail(
  to: string,
  code: string
): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@dating-app.local',
    to,
    subject: '【遇见】验证你的邮箱地址',
    text: `欢迎来到遇见！\n\n你的验证码是：${code}\n\n验证码有效期 10 分钟。\n\n—— 遇见团队 💕`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #ec4899;">💕 遇见 Dating App</h2>
        <p>感谢注册！请使用以下验证码完成邮箱验证：</p>
        <div style="background: #fce7f3; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #db2777;">${code}</span>
        </div>
        <p style="color: #666; font-size: 13px;">验证码 10 分钟内有效。如非本人操作请忽略。</p>
      </div>
    `,
  });
}
