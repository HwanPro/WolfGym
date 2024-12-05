import { NextResponse } from "next/server";
import Culqi from "culqi-node";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import { z } from "zod";

const chargeSchema = z.object({
  token: z.object({
    id: z.string(),
  }),
  amount: z.number().min(1),
  currency: z.string().default("PEN"),
  description: z.string().optional(),
  email: z.string().email(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "No autorizado" },
      { status: 401 }
    );
  }

  if (!process.env.CULQI_SECRET_KEY) {
    return NextResponse.json({ success: false, message: "Pasarela de pago deshabilitada temporalmente." });
  }  
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }

  try {
    const data = chargeSchema.parse(await request.json());
    const { token, amount, currency, description, email } = data;

    const culqi = new Culqi({
      api_key: process.env.CULQI_SECRET_KEY,
    });

    const charge = await culqi.charges.create({
      amount: amount, // Monto en centimos
      currency_code: currency,
      email: email,
      source_id: token.id,
      description: description || "Pago de Wolf Gym",
    });

    return NextResponse.json({ success: true, charge });
  } catch (error: any) {
    console.error("Error creando el cargo:", error);
    const errorMessage =
      error.response?.data?.user_message || "Error al procesar el pago";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: error.response?.status || 400 }
    );
  }
}
