
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendAcceptanceEmail = async (user) => {
  const info = await transporter.sendMail({
    from: `"Concert Ticket" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Votre compte a été accepté !",
    text: `Bonjour ${user.prenom} ${user.nom},

Bonne nouvelle ! Votre compte Concert Ticket a été accepté par notre administrateur.

Vous pouvez maintenant vous connecter et réserver vos places de concert.

Merci de votre confiance !

L'équipe Concert Ticket`
  });

  return info;
};

module.exports = sendAcceptanceEmail;
