import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Los Rubiales - Hotel Rural | Registro de Huéspedes",
  description: "Sistema de registro de huéspedes del Hotel Rural Los Rubiales. Gestión de check-in y check-out de apartamentos rurales.",
  keywords: ["Hotel Rural", "Los Rubiales", "Huéspedes", "Check-in", "Apartamentos rurales", "Alojamiento rural"],
  authors: [{ name: "Los Rubiales" }],
  icons: {
    icon: "/hotel-logo.png",
  },
  openGraph: {
    title: "Los Rubiales - Hotel Rural",
    description: "Sistema de registro de huéspedes del Hotel Rural Los Rubiales",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
