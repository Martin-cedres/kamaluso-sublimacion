import type { Metadata } from "next";
import { Raleway, Open_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WhatsAppFloating } from "@/components/ui/WhatsAppFloating";
import { KAMALUSO_ORGANIZATION_SCHEMA } from "@/lib/schema";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const KAMALUSO_LOGO_URL =
  "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000163-7555a7555c/LOGO.png?ph=904ccf23c3";

export const metadata: Metadata = {
  title: {
    default: "Kamaluso | Insumos y Papelería Sublimable en Uruguay",
    template: "%s | Kamaluso Sublimación",
  },
  description:
    "Fabricantes de interiores y tapas sublimables de 350gr para agendas, libretas, blocks y cuadernos. Envíos a todo Uruguay desde San José de Mayo.",
  metadataBase: new URL("https://www.kamaluso.com"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "interiores de agendas para sublimar",
    "papeleria sublimable uruguay",
    "tapas sublimables 350gr",
    "agendas sublimables san jose",
    "insumos para sublimacion uruguay",
    "kamaluso sublimacion",
  ],
  icons: {
    icon: [
      { url: KAMALUSO_LOGO_URL },
      { url: KAMALUSO_LOGO_URL, type: "image/png" },
    ],
    shortcut: KAMALUSO_LOGO_URL,
    apple: KAMALUSO_LOGO_URL,
  },
  openGraph: {
    title: "Kamaluso | Insumos y Papelería Sublimable en Uruguay",
    description:
      "Interiores de agendas 2026/27, libretas y blocks con tapas sublimables de 350gr. Envíos a todo el país desde San José de Mayo.",
    url: "https://www.kamaluso.com",
    siteName: "Kamaluso Sublimación",
    locale: "es_UY",
    type: "website",
    images: [
      {
        url: KAMALUSO_LOGO_URL,
        width: 800,
        height: 800,
        alt: "Kamaluso Papelería Sublimable Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kamaluso | Papelería Sublimable Uruguay",
    description:
      "Interiores y tapas de 350gr para sublimadores en Uruguay. San José de Mayo.",
    images: [KAMALUSO_LOGO_URL],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${raleway.variable} ${openSans.variable}`}>
      <head>
        <link rel="icon" href={KAMALUSO_LOGO_URL} />
        <link rel="apple-touch-icon" href={KAMALUSO_LOGO_URL} />
        {/* Marcado de Entidad Local & SEO/GEO global */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(KAMALUSO_ORGANIZATION_SCHEMA),
          }}
        />
      </head>

      <body className="font-sans antialiased bg-slate-50 text-slate-800 flex flex-col min-h-screen">
        <CartProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppFloating />
        </CartProvider>
      </body>
    </html>
  );
}
