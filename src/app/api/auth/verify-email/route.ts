// src/app/api/auth/verify-email/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(new URL("/?error=InvalidToken", req.url));
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.identifier !== email) {
    return NextResponse.redirect(new URL("/?error=InvalidToken", req.url));
  }

  if (verificationToken.expires < new Date()) {
    return NextResponse.redirect(new URL("/?error=TokenExpired", req.url));
  }

  // Actualiza el usuario para marcar el correo como verificado
  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });
  
  console.log(`Correo electrónico verificado para: ${email}`);

  // Elimina el token de verificación
  await prisma.verificationToken.delete({
    where: { token },
  });

  // Redirige al usuario a la página principal con un mensaje de éxito
  return NextResponse.redirect(new URL("/?success=EmailVerified", req.url));
}
