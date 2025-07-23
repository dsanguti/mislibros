const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Configuración del transportador de email (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Función para generar token de verificación
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Función para enviar email de verificación
const sendVerificationEmail = async (email, verificationToken, userName) => {
  console.log(`=== INICIO ENVÍO EMAIL ===`);
  console.log(`Email destino: ${email}`);
  console.log(`Usuario: ${userName}`);
  console.log(`Email origen: ${process.env.EMAIL_USER}`);
  console.log(
    `¿Tiene contraseña de aplicación?: ${
      process.env.EMAIL_PASSWORD ? "SÍ" : "NO"
    }`
  );

  // Log temporal para diagnosticar variables de entorno
  console.log(`🔍 Variables de entorno disponibles:`);
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`  - BACKEND_URL: ${process.env.BACKEND_URL || "NO DEFINIDA"}`);
  console.log(
    `  - RAILWAY_STATIC_URL: ${process.env.RAILWAY_STATIC_URL || "NO DEFINIDA"}`
  );
  console.log(
    `  - RAILWAY_PUBLIC_DOMAIN: ${
      process.env.RAILWAY_PUBLIC_DOMAIN || "NO DEFINIDA"
    }`
  );
  console.log(`  - PORT: ${process.env.PORT}`);

  // Determinar la URL del backend de manera más robusta
  let backendUrl;
  if (process.env.BACKEND_URL) {
    backendUrl = process.env.BACKEND_URL;
    console.log(`✅ Usando BACKEND_URL de variables de entorno: ${backendUrl}`);
  } else if (process.env.RAILWAY_STATIC_URL) {
    backendUrl = process.env.RAILWAY_STATIC_URL;
    console.log(`✅ Usando RAILWAY_STATIC_URL: ${backendUrl}`);
  } else if (process.env.NODE_ENV === "production") {
    // En producción, intentar usar la URL de Railway
    backendUrl = "https://mislibros-backend-production.up.railway.app";
    console.log(`✅ Usando URL de Railway por defecto: ${backendUrl}`);
  } else {
    backendUrl = "http://localhost:8001";
    console.log(`✅ Usando localhost para desarrollo: ${backendUrl}`);
  }

  const verificationUrl = `${backendUrl}/api/verify-email?token=${verificationToken}`;
  console.log(`URL de verificación final: ${verificationUrl}`);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verificación de cuenta - MisLibros",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">¡Bienvenido a MisLibros!</h2>
        <p>Hola ${userName},</p>
        <p>Tu cuenta ha sido creada exitosamente. Para activarla, por favor haz clic en el siguiente enlace:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verificar mi cuenta
          </a>
        </div>
        <p>Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>Este enlace expirará en 24 horas por motivos de seguridad.</p>
        <p>Si no solicitaste esta cuenta, puedes ignorar este email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          Este es un email automático, por favor no respondas a este mensaje.
        </p>
      </div>
    `,
  };

  try {
    console.log(`Intentando enviar email con nodemailer...`);
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado exitosamente a ${email}`);
    console.log(`=== FIN ENVÍO EMAIL (ÉXITO) ===`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email:`, error);
    console.error(`Detalles del error:`, error.message);
    console.log(`=== FIN ENVÍO EMAIL (ERROR) ===`);
    return false;
  }
};

// Función para enviar email de recuperación de contraseña
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  console.log(`=== INICIO ENVÍO EMAIL RECUPERACIÓN ===`);
  console.log(`Email destino: ${email}`);
  console.log(`Usuario: ${userName}`);
  console.log(`Email origen: ${process.env.EMAIL_USER}`);

  const resetUrl = `${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }/reset-password?token=${resetToken}`;
  console.log(`URL de recuperación: ${resetUrl}`);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Recuperación de contraseña - MisLibros",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Recuperación de Contraseña</h2>
        <p>Hola ${userName},</p>
        <p>Has solicitado restablecer tu contraseña en MisLibros. Para continuar, haz clic en el siguiente enlace:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Restablecer mi contraseña
          </a>
        </div>
        <p>Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p><strong>Este enlace expirará en 1 hora por motivos de seguridad.</strong></p>
        <p>Si no solicitaste este cambio de contraseña, puedes ignorar este email. Tu contraseña actual permanecerá sin cambios.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          Este es un email automático, por favor no respondas a este mensaje.
        </p>
      </div>
    `,
  };

  try {
    console.log(`Intentando enviar email de recuperación con nodemailer...`);
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recuperación enviado exitosamente a ${email}`);
    console.log(`=== FIN ENVÍO EMAIL RECUPERACIÓN (ÉXITO) ===`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email de recuperación:`, error);
    console.error(`Detalles del error:`, error.message);
    console.log(`=== FIN ENVÍO EMAIL RECUPERACIÓN (ERROR) ===`);
    return false;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
