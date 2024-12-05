// app/verify-email/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verificando tu correo electrónico...");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        setMessage("Token de verificación inválido o faltante.");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage("¡Correo electrónico verificado exitosamente!");
          // Puedes redirigir al usuario o mostrar un enlace para iniciar sesión
        } else {
          setMessage(data.message || "Error al verificar el correo electrónico.");
        }
      } catch (error) {
        console.error("Error al verificar el correo electrónico:", error);
        setMessage("Error al verificar el correo electrónico.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="p-6 bg-black min-h-screen text-white flex items-center justify-center">
      <h1 className="text-xl">{message}</h1>
    </div>
  );
}
