//src/app/api/verify/route.ts

import prisma from "@/libs/prisma";
import { getEmailFromToken } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Token no proporcionado." },
      { status: 400 }
    );
  }

  try {
    const email = getEmailFromToken(token); // Decodifica el token para obtener el email

    if (!email) {
      return NextResponse.json(
        { error: "Token inválido o caducado." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Cuenta activada exitosamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al activar la cuenta." },
      { status: 500 }
    );
  }
}
