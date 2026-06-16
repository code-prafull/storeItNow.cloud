const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    // try sending email with a single retry
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
      });
    } catch (err) {
      console.warn('First email send attempt failed, retrying once...', err.message);
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to,
          subject,
          text,
        });
      } catch (err2) {
        console.error('Email send failed after retry:', err2.message);
        throw err2;
      }
    }
};

module.exports = sendEmail;