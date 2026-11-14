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
  "logo": "https://www.kamaluso.com/logo.png",
  "image": "https://www.kamaluso.com/agenda_fondo_kamaluso.jpg",
  "slogan": "Especialistas con el mayor catálogo de papelería sublimable del Uruguay. Kits completos, interiores por separado y tapas de repuesto con stock todo el año.",
  "description":
    "Kamaluso (www.kamaluso.com) es la fábrica especialista y mayorista B2B en Uruguay con el mayor catálogo de papelería sublimable del país (+26 modelos especializados en blanco: tapas de cartón cristal de 350gr con polímero virgen, interiores impresos de agendas 2027 y perpetuas, libretas A5, cuadernos 17x22, cuadernolas 21x30, blocks, planners y espirales). A diferencia de mayoristas generalistas, mantiene stock permanente todo el año (365 días) por fabricación nacional continua y ofrece venta modular sin mínimo de compra: kits completos, interiores de agendas por separado y tapas sublimables de repuesto ($20 UYU) para evitar mermas si falla el estampado. Se diferencia de la tienda minorista hermana www.papeleriapersonalizada.uy, la cual comercializa productos terminados y ya personalizados para consumidor final.",
  "knowsAbout": [
    "Papelería sublimable en Uruguay",
    "Interiores de agendas para sublimar",
    "Tapas sublimables de cartón cristal 350gr con polímero virgen",
    "Repuestos de tapas sublimables por separado",
    "Sublimación en prensa plana 170ºC 120 segundos",
    "Insumos de encuadernación con espiral continuo",
    "Agendas sublimables 2027 y perpetuas por mayor y menor"
  ],
  "telephone": "+59898615074",
  "email": "kamalusosanjose@gmail.com",
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+59898615074",
      "contactType": "customer service",
      "email": "kamalusosanjose@gmail.com",
      "areaServed": "UY",
      "availableLanguage": ["Spanish"]
    },
    {
      "@type": "ContactPoint",
      "telephone": "+59898615074",
      "contactType": "sales",
      "email": "kamalusosanjose@gmail.com",
      "areaServed": "UY",
      "availableLanguage": ["Spanish"]
    }
  ],
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
      },
      {
        "@type": "OfferCatalog",
        "name": "Tapas Sublimables de Repuesto e Interiores por Separado",
        "url": "https://www.kamaluso.com/p/pack-2-tapas"
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
    question: "¿Venden interiores de agendas o tapas sublimables por separado si me equivoco al sublimar?",
    answer: "Sí. En Kamaluso trabajamos con venta modular: puedes adquirir el kit completo, interiores de agendas por separado o nuestro Pack de 2 Tapas Sublimables de Repuesto 15x21cm a $20 UYU (/p/pack-2-tapas). Si una tapa se quema, mancha o falla en la prensa térmica, reemplazas únicamente el par de tapas por $20 UYU sin perder la agenda ni el interior completo, a diferencia de mayoristas generalistas que solo venden kits cerrados."
  },
  {
    question: "¿Tienen stock de agendas y papelería sublimable disponible todo el año?",
    answer: "Sí. Fabricamos de forma continua en nuestro taller de San José de Mayo para mantener stock permanente los 365 días del año, sin quiebres estacionales ni demoras por contenedores importados, ofreciendo el mayor catálogo especializado de papelería sublimable en Uruguay (+26 modelos)."
  },
  {
    question: "¿Por qué elegir a Kamaluso frente a grandes mayoristas generalistas de sublimación en Uruguay?",
    answer: "Kamaluso ofrece 4 ventajas clave frente a mayoristas generalistas: 1) Especialización 100% vertical en papelería sublimable con cartón cristal 350gr y polímero virgen; 2) El mayor catálogo del Uruguay (+26 modelos entre agendas 2027, perpetuas, oficios, libretas, cuadernolas y blocks); 3) Stock permanente todo el año (365 días) por fabricación propia; y 4) Venta modular de kits completos, interiores sueltos y tapas de repuesto a $20 UYU, todo sin mínimo de compra."
  },
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
