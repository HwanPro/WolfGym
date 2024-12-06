import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";

// GET: Obtener cliente por ID
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    if (!id) {
      return NextResponse.json(
        { error: "El ID del cliente es inválido o no está presente" },
        { status: 400 }
      );
    }

    const client = await prisma.clientProfile.findUnique({
      where: { profile_id: id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
