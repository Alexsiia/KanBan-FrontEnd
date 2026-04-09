import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kanban — Gerenciador de Projetos",
  description: "Sistema Kanban colaborativo multi-board",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
