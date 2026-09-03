export const KAMALUSO_ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://www.kamaluso.com/#organization",
  "name": "Kamaluso Sublimación y Papelería",
  "legalName": "Kamaluso Papelería Sublimable",
  "url": "https://www.kamaluso.com",
  "logo": "https://904ccf23c3.clvaw-cdnwnd.com/4bd87ba30f406d392c872d4e916d45ca/200000163-7555a7555c/LOGO.png?ph=904ccf23c3",
  "image": "https://www.kamaluso.com/agenda_fondo_kamaluso.jpg",
  "description": "Fabricantes y distribuidores de insumos para sublimación en Uruguay: interiores de agendas 2026/2027, libretas, cuadernos, blocks y tapas sublimables de 350gr.",
  "telephone": "+59898615074",
  "email": "contacto@kamaluso.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "San José de Mayo",
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
  "areaServed": [
    {
      "@type": "Country",
      "name": "Uruguay"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Montevideo"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Canelones"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Maldonado"
    },
    {
      "@type": "AdministrativeArea",
      "name": "San José"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Colonia"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Paysandú"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Salto"
    }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Catálogo de Papelería Sublimable",
    "itemListElement": [
      {
        "@type": "OfferCatalog",
        "name": "Agendas Sublimables",
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
        "name": "Kits Mayoristas para Sublimar",
        "url": "https://www.kamaluso.com/categoria/kits-promos"
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
    answer: "Para nuestras tapas sublimables de 350gr recomendamos utilizar prensa plana de calor a 170ºC - 180ºC durante 120 segundos con presión media a alta."
  },
  {
    question: "¿Tienen mínimo de compra para envíos en Uruguay?",
    answer: "No, en Kamaluso vendemos sin mínimo de compra. Puedes solicitar desde 1 unidad de interiores o tapas hasta pedidos mayoristas."
  },
  {
    question: "¿Cuánto demora la preparación y despacho de los pedidos?",
    answer: "El tiempo estimado de despacho es de 48 horas hábiles a partir de la confirmación de la compra y recepción del comprobante de pago."
  },
  {
    question: "¿Hacen envíos a todo Uruguay?",
    answer: "Sí, despachamos diariamente desde San José de Mayo a Montevideo, Canelones, Maldonado, Salto, Colonia, Rivera y a todos los departamentos de Uruguay mediante agencias (DAC, Mirtrans, Turil, De Punta, etc.)."
  },
  {
    question: "¿Qué incluyen los kits e interiores de agendas sublimables?",
    answer: "Los productos incluyen las hojas interiores impresas en papel de excelente calidad, tapas y contratapas sublimables de 350gr y espirales para su posterior ensamblado."
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
