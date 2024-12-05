// src/libs/mail.ts

import nodemailer from 'nodemailer';

export async function sendVerificationEmail(email: string, token: string) {
  // Crear una cuenta de prueba en Ethereal
  let testAccount = await nodemailer.createTestAccount();

  // Crear un transportador reutilizable utilizando la cuenta de prueba de Ethereal
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user, // usuario generado por Ethereal
      pass: testAccount.pass, // contraseña generada por Ethereal
    },
  });

  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}&email=${email}`;

  // Enviar el correo electrónico con el objeto de transporte definido
  let info = await transporter.sendMail({
    from: '"Tu Aplicación" <no-reply@tuaplicacion.com>',
    to: email,
    subject: 'Verifica tu correo electrónico',
    html: `
      <p>Gracias por registrarte. Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
      <a href="${verificationUrl}">Verificar correo electrónico</a>
    `,
  });

  // Vista previa del correo electrónico enviado
  console.log('Mensaje enviado: %s', info.messageId);
  console.log('URL de vista previa: %s', nodemailer.getTestMessageUrl(info));
}
