import nodemailer from "nodemailer";
import { config } from "../config.ts";

export function buildVerificationUrl(token: string, apiBaseUrl = config.apiBaseUrl) {
  const normalizedBaseUrl = apiBaseUrl.startsWith("http://") || apiBaseUrl.startsWith("https://")
    ? apiBaseUrl
    : `http://${apiBaseUrl}`;

  return `${normalizedBaseUrl.replace(/\/$/, "")}/auth/verify/${token}`;
}

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "2e5c5bdc0d6234",
    pass: "95269be96b020a",
  },
});

/**
 * Envoie un e-mail transactionnel de vérification pour l'inscription.
 */
export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationUrl = buildVerificationUrl(token);

  const mailOptions = {
    from: '"La Pince" <no-reply@lapince.fr>',
    to: to,
    subject: "Activez votre compte - La Pince",
    html: `
      <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h2 style="color: #002b49; text-align: center;">Bienvenue sur La Pince</h2>
        <p>Merci pour votre inscription. Pour des raisons de sécurité, veuillez activer votre compte en cliquant sur le bouton ci-dessous :</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${verificationUrl}" style="background-color: #FF6855; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
            Vérifier mon adresse e-mail
          </a>
        </div>
        <p style="font-size: 11px; color: #666; text-align: center;">Si le bouton ne fonctionne pas, copiez ce lien : <br/> ${verificationUrl}</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};