import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

interface MailConfig {
  to: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

export async function sendResultsEmail(
  config: MailConfig,
  csvPath: string,
  jsonPath: string,
  summary: string,
  totalCenters: number
): Promise<void> {
  console.log('\n=== Sending results via email ===');

  // Configure transporter
  const transporterConfig: nodemailer.TransportOptions = {
    host: config.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: config.smtpPort || parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: config.smtpUser || process.env.SMTP_USER || '',
      pass: config.smtpPass || process.env.SMTP_PASS || '',
    },
  } as nodemailer.TransportOptions;

  const transporter = nodemailer.createTransport(transporterConfig);

  const attachments: nodemailer.SendMailOptions['attachments'] = [];

  if (fs.existsSync(csvPath)) {
    attachments.push({
      filename: path.basename(csvPath),
      path: csvPath,
    });
  }

  if (fs.existsSync(jsonPath)) {
    attachments.push({
      filename: path.basename(jsonPath),
      path: jsonPath,
    });
  }

  const htmlBody = `
    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8;">
      <h2>🏠 תוצאות סריקת בתי חב״ד</h2>
      <p>הסריקה הסתיימה בהצלחה!</p>
      <h3>סיכום:</h3>
      <ul>
        <li><strong>סה"כ מרכזים שנמצאו:</strong> ${totalCenters}</li>
        <li><strong>תאריך סריקה:</strong> ${new Date().toLocaleString('he-IL')}</li>
      </ul>
      <h3>פירוט מלא:</h3>
      <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; direction: ltr; text-align: left; font-size: 13px; overflow-x: auto;">${summary}</pre>
      <p>הקבצים המצורפים:</p>
      <ul>
        <li><strong>CSV</strong> - ניתן לפתוח באקסל / Google Sheets</li>
        <li><strong>JSON</strong> - לשימוש תכנותי / ייבוא למערכת CRM</li>
      </ul>
      <hr />
      <p style="color: #888; font-size: 12px;">נשלח אוטומטית ע"י Chabad Scraper Bot | Rimon CRM</p>
    </div>
  `;

  const mailOptions: nodemailer.SendMailOptions = {
    from: config.smtpUser || process.env.SMTP_USER || 'scraper@rimon-crm.com',
    to: config.to,
    subject: `🏠 תוצאות סריקת בתי חב״ד - ${totalCenters} מרכזים נמצאו`,
    html: htmlBody,
    attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`  Email sent successfully to ${config.to}`);
    console.log(`  Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`  Failed to send email:`, (error as Error).message);
    console.log('\n  To enable email, set these environment variables:');
    console.log('    SMTP_HOST=smtp.gmail.com');
    console.log('    SMTP_PORT=587');
    console.log('    SMTP_USER=your-email@gmail.com');
    console.log('    SMTP_PASS=your-app-password');
    console.log('    SEND_TO=recipient@email.com');
    console.log('\n  For Gmail: Use an App Password (not your regular password)');
    console.log('  https://myaccount.google.com/apppasswords');
    throw error;
  }
}
