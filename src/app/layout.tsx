import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aionios — Gestión Inteligente de Negocios",
  description: "Plataforma de gestión de citas, servicios y clientes para tu negocio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <noscript>
          <div style={{ padding: "2rem", fontFamily: "sans-serif", textAlign: "center", background: "#fef2f2", borderBottom: "2px solid #fca5a5" }}>
            <strong>JavaScript está desactivado en tu navegador.</strong><br />
            Aionios requiere JavaScript para funcionar. Por favor, actívalo para continuar.
          </div>
        </noscript>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
