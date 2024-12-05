// ./src/app/api/culqi/charge/route.ts

import { NextResponse } from "next/server";
import Culqi from "culqi-node";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
  }

  const { token, amount, currency, description, email } = await request.json();

  const culqi = new Culqi({
    api_key: process.env.CULQI_SECRET_KEY || "",
  });

  try {
    const charge = await culqi.charges.create({
      amount: amount, // Monto en centimos
      currency_code: currency || "PEN",
      email: email,
      source_id: token.id,
      description: description || "Pago de Wolf Gym",
    });

    return NextResponse.json({ success: true, charge });
  } catch (error: any) {
    console.error("Error creando el cargo:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
