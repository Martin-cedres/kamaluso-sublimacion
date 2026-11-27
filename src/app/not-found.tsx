import Link from "next/link";
import { ArrowRight, Home, PackageSearch, Phone } from "lucide-react";

const QUICK_LINKS = [
  {
    href: "/",
    title: "Catálogo Completo",
    description: "Explora todos los insumos sublimables disponibles.",
  },
  {
    href: "/categoria/agendas",
    title: "Agendas Sublimables",
    description: "Semanales, 1 y 2 días a la vista, perpetuas y docentes.",
  },
  {
    href: "/categoria/libretas",
    title: "Libretas y Cuadernos",
    description: "Libretas A5, cuadernos y cuadernolas 21x30 listas para estampar.",
  },
  {
    href: "/categoria/blocks-planners",
    title: "Blocks y Planners",
    description: "Blocks 10x15 con o sin renglones y planners diarios/semanales.",
  },
  {
    href: "/categoria/kits-promos",
    title: "Kits Mayoristas",
    description: "Packs por volumen pensados para talleres y revendedores.",
  },
  {
    href: "/categoria/especiales",
    title: "Especiales y Repuestos",
    description: "Recetarios, cartulinas, marcadores, calendarios y más.",
  },
  {
    href: "/p/pack-2-tapas",
    title: "Pack 2 Tapas de Repuesto",
    description: "Tapas sublimables de cartón cristal 350gr por separado.",
  },
  {
    href: "/contacto",
    title: "Contacto",
    description: "Escribinos por WhatsApp, correo o visítanos en San José de Mayo.",
  },
] as const;

export default function NotFound() {
  return (
    <main className="min-h-[75vh] bg-slate-50 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-700 font-bold text-xs uppercase tracking-wider">
            <PackageSearch className="w-4 h-4 text-brand-600" />
            <span>Error 404</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            404 — Página o insumo no encontrado
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            La URL que estás buscando no existe, fue movida o pudo haber cambiado tras una actualización de nuestro catálogo mayorista. Usa cualquiera de estos accesos directos para continuar navegando.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Ir al Catálogo Completo</span>
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-6 py-3 rounded-2xl text-sm transition-colors"
            >
              <Phone className="w-4 h-4 text-brand-600" />
              <span>Contacto</span>
            </Link>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            Secciones e insumos destacados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-brand-500 transition-all"
              >
                <div className="space-y-1">
                  <span className="block font-bold text-slate-900 group-hover:text-brand-600 transition-colors text-sm">
                    {item.title}
                  </span>
                  <span className="block text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 flex-shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
