import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import db from "@/libs/db";

export async function POST(req: Request) {
  const { userId } = await req.json();

  const secret = speakeasy.generateSecret({ length: 20 });
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  await db.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret.base32 },
  });

  return NextResponse.json({ qrCode, secret: secret.base32 });
}

export async function PUT(req: Request) {
  const { userId, token } = await req.json();
  const user = await db.user.findUnique({ where: { id: userId } });

  const isValid = speakeasy.totp.verify({
    secret: user?.twoFactorSecret || "",
    encoding: "base32",
    token,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  }

  return NextResponse.json({ message: "2FA habilitado correctamente" });
}
