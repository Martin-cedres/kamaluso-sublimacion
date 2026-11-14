import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Raleway, Open_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartContext";
import { KAMALUSO_ORGANIZATION_SCHEMA } from "@/lib/schema";

const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then((mod) => mod.CartDrawer));
const WebMcpProvider = dynamic(() => import("@/components/agent/WebMcpProvider").then((mod) => mod.WebMcpProvider));
const WhatsAppFloating = dynamic(() => import("@/components/ui/WhatsAppFloating").then((mod) => mod.WhatsAppFloating));

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
  weight: ["700", "800", "900"],
  adjustFontFallback: true,
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
  weight: ["400", "600", "700"],
  adjustFontFallback: true,
});

const KAMALUSO_LOGO_URL = "/logo.png";

export const metadata: Metadata = {
  title: {
    default: "Kamaluso | Fábrica de Insumos de Papelería Sublimable en Uruguay",
    template: "%s | Kamaluso Papelería Sublimable",
  },
  description:
    "Fábrica especialista en San José con el mayor catálogo de papelería sublimable en Uruguay (+26 modelos) y stock todo el año. Kits, interiores por separado y tapas 350gr de repuesto ($20 UYU) sin mínimo. Envíos a todo el país.",
  metadataBase: new URL("https://www.kamaluso.com"),
  manifest: "/manifest.json",
  keywords: [
    "interiores de agendas para sublimar",
    "interiores de agendas por separado",
    "papeleria sublimable uruguay",
    "mayor catalogo papeleria sublimable uruguay",
    "tapas sublimables 350gr",
    "tapas sublimables de repuesto",
    "agendas sublimables san jose",
    "insumos para sublimacion uruguay",
    "stock papeleria sublimable todo el año",
    "kamaluso sublimacion",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Kamaluso | Insumos y Papelería Sublimable en Uruguay",
    description:
      "Fábrica especialista en San José, Uruguay con el mayor catálogo de papelería sublimable (+26 modelos) y stock todo el año. Kits completos, interiores de agendas por separado y tapas 350gr de repuesto ($20 UYU) sin mínimo. Envíos a todo el país.",
    url: "https://www.kamaluso.com",
    siteName: "Kamaluso Sublimación",
    locale: "es_UY",
    type: "website",
    images: [
      {
        url: "https://www.kamaluso.com/agenda_fondo_kamaluso.jpg",
        width: 1200,
        height: 630,
        alt: "Kamaluso Insumos y Papelería Sublimable Uruguay",
      },
      {
        url: "https://www.kamaluso.com/logo.png",
        width: 512,
        height: 512,
        alt: "Kamaluso Papelería Sublimable Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kamaluso | Papelería Sublimable Uruguay",
    description:
      "Fábrica en San José con el mayor catálogo de papelería sublimable en Uruguay (+26 modelos) y stock todo el año. Kits, interiores y tapas 350gr de repuesto ($20 UYU) sin mínimo.",
    images: ["https://www.kamaluso.com/agenda_fondo_kamaluso.jpg"],
  },
  verification: {
    google: "bw88G4qbNAAwlXaP6oSzW37oRBZHDQxuJ6tAkWs5XFA",
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
        {/* Preconexión al CDN de Vercel Blob para carga ultra rápida de imágenes de productos */}
        <link rel="preconnect" href="https://ek73dobkmkhaebws.public.blob.vercel-storage.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://ek73dobkmkhaebws.public.blob.vercel-storage.com" />
        {/* Enlaces de descubrimiento de agentes IA (RFC 8288, RFC 9727, ARD) */}
        <link rel="ai-catalog" href="/.well-known/ai-catalog.json" />
        <link rel="api-catalog" href="/.well-known/api-catalog" />
        <link rel="service-desc" href="/.well-known/mcp/server-card.json" />
        <link rel="service-desc" href="/.well-known/agent-card.json" />
        <link rel="service-meta" href="/.well-known/agent-skills/index.json" />
        <link rel="service-doc" href="/llms.txt" />
        <link rel="author" href="/auth.md" />
        {/* Marcado de Entidad Local & SEO/GEO global */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(KAMALUSO_ORGANIZATION_SCHEMA),
          }}
        />
      </head>

      <body className="font-sans antialiased bg-slate-50 text-slate-800 flex flex-col min-h-screen">
        <WebMcpProvider />
        <CartProvider>
          <Header />
          <main id="main-content" className="flex-grow">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppFloating />
        </CartProvider>
      </body>
    </html>
  );
}
