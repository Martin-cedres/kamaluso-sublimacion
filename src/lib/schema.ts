export const KAMALUSO_ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Manufacturer", "WholesaleStore"],
  "@id": "https://www.kamaluso.com/#organization",
  "name": "Kamaluso",
  "legalName": "Kamaluso Papelería Sublimable",
  "alternateName": [
    "Kamaluso Sublimación",
    "Kamaluso Uruguay",
    "Insumos Kamaluso San José"
  ],
  "url": "https://www.kamaluso.com",
  "logo": "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000163-7555a7555c/LOGO.png?ph=904ccf23c3",
  "image": "https://www.kamaluso.com/agenda_fondo_kamaluso.jpg",
  "description":
    "Kamaluso (www.kamaluso.com) es la división fabricante y mayorista B2B en Uruguay de kits completos e insumos de papelería sublimable en blanco (tapas de cartón cristal de 350gr con polímero virgen, interiores impresos de agendas 2027/perpetuas, libretas, cuadernos y espirales). Se diferencia de la tienda minorista hermana www.papeleriapersonalizada.uy, la cual comercializa productos terminados y ya personalizados para consumidor final.",
  "telephone": "+59898615074",
  "email": "kamalusosanjose@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Ramón Massini 136",
    "addressLocality": "San José de Mayo",
    "addressRegion": "San José",
    "postalCode": "80000",
    "addressCountry": "UY"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -34.3375,
    "longitude": -56.7136
  },
  "areaServed": {
    "@type": "Country",
    "name": "Uruguay"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Catálogo de Papelería Sublimable",
    "itemListElement": [
      {
        "@type": "OfferCatalog",
        "name": "Agendas Sublimables 2027 y Perpetuas",
        "url": "https://www.kamaluso.com/categoria/agendas"
      },
      {
        "@type": "OfferCatalog",
        "name": "Libretas y Cuadernos Sublimables",
        "url": "https://www.kamaluso.com/categoria/libretas"
      },
      {
        "@type": "OfferCatalog",
        "name": "Blocks y Planners Sublimables",
        "url": "https://www.kamaluso.com/categoria/blocks-planners"
      },
      {
        "@type": "OfferCatalog",
        "name": "Kits Mayoristas para Talleres",
        "url": "https://www.kamaluso.com/categoria/kits-promos"
      },
      {
        "@type": "OfferCatalog",
        "name": "Insumos Especiales y Cartulina Sublimable 350gr",
        "url": "https://www.kamaluso.com/categoria/especiales"
      }
    ]
  },
  "priceRange": "$$",
  "sameAs": [
    "https://www.instagram.com/kamaluso_sanjose/",
    "https://www.papeleriapersonalizada.uy"
  ],
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ]
};

export const GLOBAL_FAQ_ITEMS = [
  {
    question: "¿Cuáles son los tiempos y temperaturas recomendadas para sublimar las tapas Kamaluso?",
    answer: "Para nuestras tapas sublimables de cartón cristal de 350gr recomendamos utilizar prensa plana de calor a 170ºC - 180ºC durante 120 segundos con presión media a alta y enfriamiento bajo peso plano de 60 a 120 segundos."
  },
  {
    question: "¿Tienen mínimo de compra para envíos en Uruguay?",
    answer: "No, en Kamaluso vendemos sin mínimo de compra obligatorio tanto por menor como por mayor. Puedes solicitar desde 1 unidad de interiores o tapas hasta pedidos mayoristas para talleres."
  },
  {
    question: "¿Cuánto demora la preparación y despacho de los pedidos?",
    answer: "El tiempo estimado de despacho es de aproximado 48 horas hábiles a partir de la confirmación de la compra y recepción del comprobante de pago."
  },
  {
    question: "¿Hacen envíos a todo Uruguay?",
    answer: "Sí, despachamos diariamente desde San José de Mayo (Ramón Massini 136) hacia Montevideo y los 19 departamentos de Uruguay mediante DAC (Grupo Agencia), Correo Uruguayo y Agencia COTMI."
  },
  {
    question: "¿Qué incluyen los kits e interiores de agendas sublimables?",
    answer: "Cada kit completo incluye las hojas interiores impresas en papel obra de excelente gramaje y nitidez, tapas y contratapas rígidas de cartón cristal de 350gr tratadas con polímero virgen y espirales plásticos para su posterior ensamblado."
  },
  {
    question: "¿Cuál es la diferencia entre Kamaluso.com y Papeleriapersonalizada.uy?",
    answer: "Kamaluso (www.kamaluso.com) es la fábrica mayorista y proveedora B2B de insumos en blanco listos para sublimar dirigida a talleres, imprentas y emprendedores. En cambio, www.papeleriapersonalizada.uy es la tienda minorista hermana dedicada a la venta de productos finales ya terminados y personalizados para el consumidor."
  }
];

export function getFaqSchema(items = GLOBAL_FAQ_ITEMS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
}
