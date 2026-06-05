const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  const isMockUser = !process.env.SMTP_USER || process.env.SMTP_USER === 'mock_user';
  const isMockPass = !process.env.SMTP_PASS || process.env.SMTP_PASS === 'mock_pass' || process.env.SMTP_PASS.includes('your_gmail_app_password');

  // If mock credentials or default placeholders are used, try to generate a test Ethereal account
  if (isMockUser || isMockPass) {
    console.log('--- Using Ethereal Email Service (Real SMTP Credentials Not Fully Configured) ---');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass  // generated ethereal password
        }
      });
      
      console.log(`Ethereal credentials created: User=${testAccount.user}, Pass=${testAccount.pass}`);
    } catch (err) {
      console.error('Failed to create Ethereal test account. Email will be logged to console instead.', err.message);
      console.log(`=========================================
MOCK EMAIL LOG
To: ${options.email}
Subject: ${options.subject}
Message: ${options.message}
=========================================`);
      return;
    }
  } else {
    // Normal configured SMTP or Gmail
    const isGmail = process.env.SMTP_HOST === 'smtp.gmail.com' || (process.env.SMTP_USER && process.env.SMTP_USER.endsWith('@gmail.com'));
    
    if (isGmail) {
      // Use nodemailer's built-in service definition for Gmail to ensure TLS/SSL config is correct
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  const message = {
    from: `"${process.env.FROM_NAME || 'EduStream Course Platform'}" <${process.env.FROM_EMAIL || 'noreply@courseplatform.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`
  };

  const info = await transporter.sendMail(message);

  console.log(`Message sent: ${info.messageId}`);
  
  // Log link to Ethereal viewable message if using Ethereal
  if (transporter.options && transporter.options.host === 'smtp.ethereal.email') {
    const testUrl = nodemailer.getTestMessageUrl(info);
    console.log(`Preview URL: ${testUrl}`);
    return testUrl;
  }
};

module.exports = sendEmail;
