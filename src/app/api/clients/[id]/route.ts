import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { z } from "zod";

// Esquema de validación para actualizar cliente
const clientUpdateSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  plan: z.enum(["Básico", "Premium", "VIP"]),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de inicio inválida",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de fin inválida",
  }),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  emergencyPhone: z.string().min(10, "El teléfono de emergencia debe tener al menos 10 dígitos"),
});

// Utilidad para verificar el ID del cliente
function checkClientId(id: string | undefined) {
  if (!id) {
    throw new Error("El ID del cliente es inválido o no está presente");
  }
}

// Manejo de errores del servidor
function handleServerError(error: any) {
  console.error("Error interno:", error);
  return NextResponse.json(
    {
      error:
        error instanceof z.ZodError
          ? error.errors.map((e) => e.message).join(", ")
          : error.message || "Error interno del servidor",
    },
    { status: error instanceof z.ZodError ? 400 : 500 }
  );
}

// GET: Obtener cliente por ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    checkClientId(params.id);

    const client = await prisma.clientProfile.findUnique({
      where: { profile_id: params.id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    return handleServerError(error);
  }
}

// PUT: Actualizar cliente por ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    checkClientId(params.id);

    const body = await req.json();
    const validatedData = clientUpdateSchema.parse(body);

    const updatedClient = await prisma.clientProfile.update({
      where: { profile_id: params.id },
      data: {
        profile_first_name: validatedData.firstName,
        profile_last_name: validatedData.lastName,
        profile_plan: validatedData.plan,
        profile_start_date: new Date(validatedData.startDate),
        profile_end_date: new Date(validatedData.endDate),
        profile_phone: validatedData.phone,
        profile_emergency_phone: validatedData.emergencyPhone,
      },
    });

    return NextResponse.json(
      { message: "Cliente actualizado con éxito", updatedClient },
      { status: 200 }
    );
  } catch (error) {
    return handleServerError(error);
  }
}

// DELETE: Eliminar cliente por ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    checkClientId(params.id);

    const client = await prisma.clientProfile.findUnique({
      where: { profile_id: params.id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    await prisma.clientProfile.delete({
      where: { profile_id: params.id },
    });

    await prisma.user.delete({
      where: { id: client.user_id },
    });

    return NextResponse.json(
      { message: "Cliente eliminado con éxito" },
      { status: 200 }
    );
  } catch (error) {
    return handleServerError(error);
  }
}
