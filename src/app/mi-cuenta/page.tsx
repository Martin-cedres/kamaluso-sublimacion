import type { Metadata } from "next";
import MiCuentaClient from "@/components/customer/MiCuentaClient";

export const metadata: Metadata = {
  title: "Mi Cuenta y Mis Pedidos | Kamaluso",
  description:
    "Consultá tu historial de compras, repetí pedidos anteriores en un clic y guardá tus datos de envío en Kamaluso Uruguay.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MiCuentaPage() {
  return <MiCuentaClient />;
}
