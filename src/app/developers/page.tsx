import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Code2, Terminal, Cpu, ShieldCheck, Zap, BookOpen, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Portal de Desarrolladores & Agentes de IA | Kamaluso API & MCP",
  description:
    "Documentación oficial, OpenAPI 3.1, Model Context Protocol (MCP) streamable y guías de integración para asistentes autónomos y desarrolladores de la fábrica Kamaluso en Uruguay.",
  alternates: {
    canonical: "https://www.kamaluso.com/developers",
  },
};

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-700 font-bold text-xs uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-brand-600" />
            <span>Agent-Ready • Model Context Protocol & REST API</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Portal de Desarrolladores & <span className="text-brand-600">Agentes de IA</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
            Bienvenido al portal oficial de ingeniería de <strong>Kamaluso Papelería Sublimable</strong> (San José de Mayo, Uruguay). Nuestra plataforma ofrece integración sin fricción (Zero-Auth en catálogo público), especificación formal <strong>OpenAPI 3.1</strong>, servidor <strong>Model Context Protocol (MCP)</strong> y documentación nativa para modelos de lenguaje en <strong>llms.txt</strong>.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="/openapi.json"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Code2 className="w-4 h-4" />
              <span>Especificación OpenAPI 3.1</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Guía para LLMs (llms.txt)</span>
              <ExternalLink className="w-3.5 h-3.5 text-brand-200" />
            </a>

            <a
              href="/auth.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Autenticación de Agentes (auth.md)</span>
            </a>
          </div>
        </div>

        {/* Protocolos y Arquitectura */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">Zero-Auth Public API</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              El catálogo completo de insumos, stock y precios en UYU está disponible de forma abierta sin requerir API keys ni registros obligatorios.
            </p>
            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
              GET /api/products
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">MCP Streamable HTTP</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Servidor Model Context Protocol completo (JSON-RPC 2.0) para agentes Claude, Gemini, Antigravity y Cursor con herramientas de búsqueda y pedidos.
            </p>
            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
              POST /api/mcp
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">Rate Limits & Errores RFC 9457</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cabeceras estándar IETF RateLimit (120 req/min) y respuestas de error estructuradas con formato RFC 9457 application/problem+json.
            </p>
            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
              RateLimit-Limit: 120
            </div>
          </div>
        </div>

        {/* Guías Rápidas (Quickstart) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-brand-600" />
            <h2 className="text-2xl font-black text-slate-900">Guía de Inicio Rápido (Quickstart)</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-2">1. Consultar catálogo en cURL</h4>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs overflow-x-auto font-mono leading-relaxed">
{`curl -X GET "https://www.kamaluso.com/api/products" \\
  -H "Accept: application/json"`}
              </pre>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-2">2. Consultar catálogo en Python</h4>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs overflow-x-auto font-mono leading-relaxed">
{`import requests

res = requests.get("https://www.kamaluso.com/api/products")
products = res.json()
print(f"Total productos disponibles: {len(products)}")
for p in products[:3]:
    print(f"- {p['name']}: \${p['price']} UYU")`}
              </pre>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-2">3. Conexión Model Context Protocol (MCP) en Claude Desktop / Antigravity</h4>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs overflow-x-auto font-mono leading-relaxed">
{`{
  "mcpServers": {
    "kamaluso": {
      "url": "https://www.kamaluso.com/api/mcp"
    }
  }
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Catálogo de Endpoints */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-2xl font-black text-slate-900">Endpoints Principales</h2>

          <div className="space-y-6 divide-y divide-slate-100">
            <div className="pt-4 first:pt-0 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs font-mono">GET</span>
                <span className="font-mono text-sm font-bold text-slate-900">/api/products</span>
                <span className="text-xs text-slate-400 font-mono">(Alias: /api/v1/products)</span>
              </div>
              <p className="text-xs text-slate-600">
                Retorna la lista de productos e insumos sublimables con precios, fotos WebP/AVIF optimizadas, descripción, stock y categorías.
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-xs font-mono">POST</span>
                <span className="font-mono text-sm font-bold text-slate-900">/api/orders</span>
                <span className="text-xs text-slate-400 font-mono">(Alias: /api/v1/orders)</span>
              </div>
              <p className="text-xs text-slate-600">
                Registra un pedido mayorista o minorista con lista de artículos, agencia de transporte en Uruguay y método de pago en UYU.
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-xs font-mono">POST</span>
                <span className="font-mono text-sm font-bold text-slate-900">/api/mcp</span>
              </div>
              <p className="text-xs text-slate-600">
                Protocolo Model Context Protocol (Streamable HTTP / JSON-RPC 2.0). Soporta herramientas: <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">search_products</code>, <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">get_product_details</code>, <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">get_sublimation_parameters</code>.
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs font-mono">GET</span>
                <span className="font-mono text-sm font-bold text-slate-900">/api/health</span>
              </div>
              <p className="text-xs text-slate-600">
                Healthcheck y estado del cluster en Vercel Edge con tiempo de respuesta y uptime.
              </p>
            </div>
          </div>
        </div>

        {/* Políticas y Soporte */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-2xl font-black">Contacto y Soporte para Desarrolladores</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            ¿Estás integrando un agente de compras, un sistema ERP para imprentas o un plugin personalizado? Nuestro equipo técnico te brinda soporte directo.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold">
            <span className="text-slate-300">Email: <strong className="text-white">kamalusosanjose@gmail.com</strong></span>
            <span className="text-slate-300">WhatsApp Técnico: <strong className="text-white">+598 98 615 074</strong></span>
            <span className="text-slate-300">Ubicación: <strong className="text-white">San José de Mayo, Uruguay</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
