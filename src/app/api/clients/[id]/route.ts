import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// Esquema de validación para actualización
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
  phone: z.string(),
  emergencyPhone: z.string(),
});

export async function GET(
  req: NextRequest,
  context: { params: Record<string, string | undefined> }
) {
  const id = context.params.id;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { error: "El ID del cliente es inválido" },
      { status: 400 }
    );
  }

  try {
    const client = await prisma.clientProfile.findUnique({
      where: { profile_id: Number(id) },
      include: {
        user: true,
      },
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

export async function PUT(
  req: NextRequest,
  context: { params: Record<string, string | undefined> }
) {
  const id = context.params.id;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { error: "El ID del cliente es inválido" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const validatedData = clientUpdateSchema.parse(body);

    const phoneNumber = parsePhoneNumberFromString(validatedData.phone, "PE");
    const emergencyPhoneNumber = parsePhoneNumberFromString(
      validatedData.emergencyPhone,
      "PE"
    );

    if (!phoneNumber?.isValid() || !emergencyPhoneNumber?.isValid()) {
      return NextResponse.json(
        { error: "Los números de teléfono no son válidos" },
        { status: 400 }
      );
    }

    const updatedClient = await prisma.clientProfile.update({
      where: { profile_id: Number(id) },
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
    console.error("Error al actualizar cliente:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Record<string, string | undefined> }
) {
  const id = context.params.id;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { error: "El ID del cliente es inválido" },
      { status: 400 }
    );
  }

  try {
    const client = await prisma.clientProfile.findUnique({
      where: { profile_id: Number(id) },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    await prisma.clientProfile.delete({
      where: { profile_id: Number(id) },
    });

    await prisma.user.delete({
      where: { id: client.user_id },
    });

    return NextResponse.json(
      { message: "Cliente eliminado con éxito" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
