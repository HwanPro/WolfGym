// ./src/components/CulqiPaymentForm.tsx

"use client";

import React, { useEffect, useImperativeHandle, forwardRef } from "react";

type CulqiPaymentFormProps = {
  onSuccess: (charge: any) => void;
  onError: (error: string) => void;
};

export type CulqiPaymentFormHandle = {
  openCulqi: (paymentData: { amount: number; description: string; email: string }) => void;
};

const CulqiPaymentForm = forwardRef<CulqiPaymentFormHandle, CulqiPaymentFormProps>(
  ({ onSuccess, onError }, ref) => {
    useEffect(() => {
      // Cargar el script de Culqi cuando el componente se monta
      const script = document.createElement("script");
      script.src = "https://checkout.culqi.com/js/v3";
      script.async = true;
      script.onload = () => {
        console.log("Culqi script loaded");
      };
      script.onerror = () => {
        console.error("Error loading Culqi script");
      };
      document.body.appendChild(script);

      // Limpiar el script cuando el componente se desmonta
      return () => {
        document.body.removeChild(script);
      };
    }, []);

    const openCulqi = (paymentData: { amount: number; description: string; email: string }) => {
      const { amount, description, email } = paymentData;

      if (!window.Culqi) {
        alert("Culqi no está cargado correctamente.");
        return;
      }

      // Configurar la clave pública de Culqi
      window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;

      // Abrir el formulario de pago de Culqi
      window.Culqi.open({
        title: "Wolf Gym",
        currency: "PEN",
        description: description || "Pago de Membresía",
        amount: amount, // Monto en centimos, por ejemplo: S/. 60.00 = 6000
        email: email,
      });
    };

    useImperativeHandle(ref, () => ({
      openCulqi,
    }));

    useEffect(() => {
      if (window.Culqi) {
        // Manejar el evento de Culqi después de que el usuario completa el formulario de pago
        const onCulqi = async (event: any) => {
          const token = event.detail;

          if (token.error) {
            onError(token.error.message);
          } else {
            const { amount, description, email } = token;

            // Enviar el token al servidor para procesar el pago
            try {
              const response = await fetch("/api/culqi/charge", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  token,
                  amount,
                  currency: "PEN",
                  description: description || "Pago de Membresía",
                  email: email,
                }),
              });

              const data = await response.json();
              if (data.success) {
                onSuccess(data.charge);
              } else {
                onError(data.message || "Error procesando el pago.");
              }
            } catch (error: any) {
              console.error("Error al procesar el pago:", error);
              onError(error.message || "Error al procesar el pago.");
            }
          }
        };

        window.addEventListener("culqi", onCulqi);

        // Limpiar el event listener cuando el componente se desmonta
        return () => {
          window.removeEventListener("culqi", onCulqi);
        };
      }
    }, [onError, onSuccess]);

    return null; // No renderizar nada
  }
);

CulqiPaymentForm.displayName = "CulqiPaymentForm";

export default CulqiPaymentForm;
