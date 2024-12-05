"use client";

import React, { useEffect, useImperativeHandle, forwardRef } from "react";

type PaymentData = {
  amount: number;
  description: string;
  email: string;
};

type CulqiEventDetail = {
  id: string;
  email: string;
  amount: number;
  currency: string;
  description: string;
  error?: { message: string };
};
;

type CulqiPaymentFormProps = {
  onSuccess: (charge: any) => void;
  onError: (error: string) => void;
};

export type CulqiPaymentFormHandle = {
  openCulqi: (paymentData: PaymentData) => void;
};

const CulqiPaymentForm = forwardRef<CulqiPaymentFormHandle, CulqiPaymentFormProps>(
  ({ onSuccess, onError }, ref) => {
    useEffect(() => {
      // Cargar el script de Culqi
      const script = document.createElement("script");
      script.src = "https://checkout.culqi.com/js/v3";
      script.async = true;

      script.onload = () => {
        console.log("Culqi script cargado.");
      };

      script.onerror = () => {
        console.error("Error al cargar el script de Culqi.");
      };

      document.body.appendChild(script);

      // Limpiar el script al desmontar
      return () => {
        document.body.removeChild(script);
      };
    }, []);

    const openCulqi = (paymentData: PaymentData) => {
      const { amount, description, email } = paymentData;

      if (!window.Culqi) {
        onError("Culqi no está cargado correctamente.");
        return;
      }

      // Configurar clave pública
      window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || "";

      // Abrir formulario de pago
      window.Culqi.open({
        title: "Wolf Gym",
        currency: "PEN",
        description,
        amount, // Monto en céntimos (ej. S/. 60.00 = 6000)
        email,
      });
    };

    useImperativeHandle(ref, () => ({
      openCulqi,
    }));

    useEffect(() => {
      const handleCulqiEvent = async () => {
        const token: CulqiToken = window.Culqi.token;

        if (!token || token.error) {
          onError(token?.error?.message || "Error al generar el token.");
          return;
        }

        // Procesar el pago
        try {
          const response = await fetch("/api/culqi/charge", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token,
              amount: token.amount,
              currency: "PEN",
              description: token.card_number,
              email: token.email,
            }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            onSuccess(data.charge);
          } else {
            onError(data.message || "Error procesando el pago.");
          }
        } catch (err) {
          console.error("Error al procesar el pago:", err);
          onError("Error al procesar el pago.");
        }
      };

      if (window.Culqi) {
        window.addEventListener("culqi", handleCulqiEvent);
      }

      // Cleanup del evento
      return () => {
        if (window.Culqi) {
          window.removeEventListener("culqi", handleCulqiEvent);
        }
      };
    }, [onError, onSuccess]);

    return null; // No renderiza elementos visuales
  }
);

CulqiPaymentForm.displayName = "CulqiPaymentForm";

export default CulqiPaymentForm;
