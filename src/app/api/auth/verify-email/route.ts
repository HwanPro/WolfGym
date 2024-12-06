// /app/api/auth/verify-email/route.ts

import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Token no proporcionado." },
        { status: 400 }
      );
    }

    // Buscar el token en la base de datos
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.expires < new Date()) {
      return NextResponse.json(
        { message: "Token inválido o expirado." },
        { status: 400 }
      );
    }

    // Marcar el correo del usuario como verificado
    const userEmail = record.identifier; // Asegúrate de que "identifier" en VerificationToken es el email del usuario.
    await prisma.user.update({
      where: { email: userEmail },
      data: { emailVerified: true },
    });
    
    // Eliminar el token usado
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json(
      { message: "Correo verificado exitosamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al verificar el correo:", error);
    return NextResponse.json(
      { message: "Error al verificar el correo." },
      { status: 500 }
    );
  }
}
