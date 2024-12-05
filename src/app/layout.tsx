"use client";
import "./globals.css";
import { SessionProvider, useSession } from "next-auth/react";
import React from "react"; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}
