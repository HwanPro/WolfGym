// src/app/api/clients/[id]/route.ts

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
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: "El ID del cliente es obligatorio" },
        { status: 400 }
      );
    }

    const client = await prisma.clientProfile.findUnique({
      where: { profile_id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: "El ID del cliente es obligatorio" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = clientUpdateSchema.parse(body);

    // Validación de números de teléfono
    const phoneNumber = parsePhoneNumberFromString(validatedData.phone, "PE");
    const emergencyPhoneNumber = parsePhoneNumberFromString(
      validatedData.emergencyPhone,
      "PE"
    );

    if (!phoneNumber?.isValid()) {
      return NextResponse.json(
        { error: "El número de teléfono no es válido" },
        { status: 400 }
      );
    }

    if (!emergencyPhoneNumber?.isValid()) {
      return NextResponse.json(
        { error: "El número de emergencia no es válido" },
        { status: 400 }
      );
    }

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
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: "El ID del cliente es obligatorio" },
        { status: 400 }
      );
    }

    const client = await prisma.clientProfile.findUnique({
      where: { profile_id: params.id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar el perfil del cliente
    await prisma.clientProfile.delete({
      where: { profile_id: params.id },
    });

    // Opcional: Eliminar el usuario asociado
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
