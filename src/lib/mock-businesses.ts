export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutos
}

export interface Business {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  rating: number;
  reviewCount: number;
  openNow: boolean;
  hours: string;
  gradient: string;       // para el banner decorativo
  accentColor: string;    // clase Tailwind para badges
  services: Service[];
  tags: string[];
}

export const CATEGORIES = [
  { slug: "belleza", label: "Belleza y cuidado", icon: "Scissors" },
  { slug: "construccion", label: "Construccion", icon: "HardHat" },
  { slug: "tintoreria", label: "Tintoreria", icon: "Shirt" },
  { slug: "salud", label: "Salud y bienestar", icon: "HeartPulse" },
  { slug: "educacion", label: "Educacion", icon: "BookOpen" },
  { slug: "hogar", label: "Hogar", icon: "Wrench" },
  { slug: "tecnologia", label: "Tecnologia", icon: "Laptop" },
  { slug: "fotografia", label: "Fotografia", icon: "Camera" },
] as const;

export const BUSINESSES: Business[] = [
  {
    id: "biz-001",
    name: "Salon Bella Vista",
    category: "Belleza y cuidado",
    categorySlug: "belleza",
    description:
      "Salon de belleza profesional con mas de 10 anos de experiencia. Especialistas en cortes, color, tratamientos y peinados para toda ocasion.",
    address: "Av. Insurgentes Sur 1234",
    city: "Ciudad de Mexico",
    phone: "+52 555 100 2000",
    rating: 4.9,
    reviewCount: 142,
    openNow: true,
    hours: "09:00 - 20:00",
    gradient: "from-pink-500 to-rose-600",
    accentColor: "bg-pink-50 text-pink-700 border-pink-200",
    tags: ["Cortes", "Tinte", "Manicure", "Pedicure"],
    services: [
      { id: "s1", name: "Corte de cabello dama", description: "Corte personalizado con lavado y secado", price: 280, duration: 45 },
      { id: "s2", name: "Tinte completo", description: "Aplicacion de color con productos profesionales", price: 850, duration: 120 },
      { id: "s3", name: "Manicure clasico", description: "Limpieza, forma y esmalte", price: 180, duration: 40 },
      { id: "s4", name: "Tratamiento capilar", description: "Hidratacion profunda y keratina", price: 420, duration: 60 },
      { id: "s5", name: "Brushing y peinado", description: "Secado y estilismo profesional", price: 200, duration: 35 },
    ],
  },
  {
    id: "biz-002",
    name: "Torres Construccion",
    category: "Construccion",
    categorySlug: "construccion",
    description:
      "Empresa constructora especializada en remodelaciones, construccion de interiores, instalaciones electricas y plomeria. Proyectos residenciales y comerciales.",
    address: "Blvd. Manuel Avila Camacho 45",
    city: "Monterrey",
    phone: "+52 818 200 3000",
    rating: 4.7,
    reviewCount: 89,
    openNow: true,
    hours: "08:00 - 18:00",
    gradient: "from-orange-500 to-amber-600",
    accentColor: "bg-orange-50 text-orange-700 border-orange-200",
    tags: ["Remodelacion", "Plomeria", "Electricidad", "Pintura"],
    services: [
      { id: "s1", name: "Visita de diagnostico", description: "Evaluacion del proyecto y presupuesto sin costo", price: 0, duration: 60 },
      { id: "s2", name: "Remodelacion de bano", description: "Cambio de azulejos, plomeria y accesorios", price: 8500, duration: 2880 },
      { id: "s3", name: "Instalacion electrica", description: "Cableado, tableros y contactos certificados", price: 3200, duration: 480 },
      { id: "s4", name: "Pintura interior", description: "Pintura por cuarto con materiales incluidos", price: 1800, duration: 480 },
      { id: "s5", name: "Impermeabilizacion de techo", description: "Aplicacion de membrana impermeable", price: 2500, duration: 240 },
    ],
  },
  {
    id: "biz-003",
    name: "CleanPro Tintoreria",
    category: "Tintoreria",
    categorySlug: "tintoreria",
    description:
      "Servicio profesional de tintoreria y lavanderia con entregas en 24 horas. Especialistas en ropa delicada, trajes, vestidos de novia y uniformes.",
    address: "Calle Madero 78, Centro",
    city: "Guadalajara",
    phone: "+52 333 400 5000",
    rating: 4.6,
    reviewCount: 215,
    openNow: true,
    hours: "08:30 - 19:00",
    gradient: "from-cyan-500 to-blue-600",
    accentColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    tags: ["Trajes", "Vestidos", "Ropa delicada", "Entrega rapida"],
    services: [
      { id: "s1", name: "Lavado y planchado camisa", description: "Lavado en seco y planchado profesional", price: 45, duration: 1440 },
      { id: "s2", name: "Limpieza de traje completo", description: "Saco y pantalon, lavado en seco", price: 280, duration: 1440 },
      { id: "s3", name: "Vestido de novia", description: "Limpieza especializada y preservacion", price: 950, duration: 4320 },
      { id: "s4", name: "Ropa de cama (juego)", description: "Sabanas, fundas y cobertores", price: 180, duration: 1440 },
      { id: "s5", name: "Uniforme escolar (set)", description: "Camisa, pantalon y sueter", price: 120, duration: 1440 },
    ],
  },
  {
    id: "biz-004",
    name: "RehabPlus Fisioterapia",
    category: "Salud y bienestar",
    categorySlug: "salud",
    description:
      "Centro de fisioterapia y rehabilitacion con fisioterapeutas certificados. Tratamos lesiones deportivas, dolores cronicos y recuperacion postoperatoria.",
    address: "Av. Universidad 560",
    city: "Ciudad de Mexico",
    phone: "+52 555 600 7000",
    rating: 4.9,
    reviewCount: 178,
    openNow: false,
    hours: "07:00 - 20:00",
    gradient: "from-emerald-500 to-teal-600",
    accentColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    tags: ["Lesiones", "Deportes", "Masajes", "Rehabilitacion"],
    services: [
      { id: "s1", name: "Evaluacion inicial", description: "Diagnostico y plan de tratamiento personalizado", price: 350, duration: 60 },
      { id: "s2", name: "Sesion de fisioterapia", description: "Terapia manual y ejercicios terapeuticos", price: 450, duration: 50 },
      { id: "s3", name: "Masaje deportivo", description: "Relajacion muscular profunda y recuperacion", price: 380, duration: 60 },
      { id: "s4", name: "Acupuntura", description: "Tratamiento con agujas para dolor y tension", price: 420, duration: 45 },
      { id: "s5", name: "Ultrasonido terapeutico", description: "Terapia con ondas de ultrasonido", price: 300, duration: 30 },
    ],
  },
  {
    id: "biz-005",
    name: "TechFix Reparaciones",
    category: "Tecnologia",
    categorySlug: "tecnologia",
    description:
      "Reparacion de smartphones, laptops, tablets y consolas de videojuegos. Repuestos originales y garantia en todas las reparaciones.",
    address: "Plaza Tecnologica Local 14",
    city: "Puebla",
    phone: "+52 222 800 9000",
    rating: 4.5,
    reviewCount: 302,
    openNow: true,
    hours: "10:00 - 20:00",
    gradient: "from-violet-500 to-purple-600",
    accentColor: "bg-violet-50 text-violet-700 border-violet-200",
    tags: ["Celulares", "Laptops", "Consolas", "Garantia"],
    services: [
      { id: "s1", name: "Cambio de pantalla iPhone", description: "Pantalla original, garantia 6 meses", price: 1200, duration: 60 },
      { id: "s2", name: "Reparacion de laptop", description: "Diagnostico, limpieza y reparacion", price: 800, duration: 120 },
      { id: "s3", name: "Cambio de bateria", description: "Bateria original para celulares y laptops", price: 600, duration: 45 },
      { id: "s4", name: "Recuperacion de datos", description: "Recuperacion de archivos de disco danado", price: 1500, duration: 480 },
      { id: "s5", name: "Instalacion de software", description: "Sistema operativo y programas esenciales", price: 350, duration: 90 },
    ],
  },
  {
    id: "biz-006",
    name: "Lentes y Vision Dr. Ramos",
    category: "Salud y bienestar",
    categorySlug: "salud",
    description:
      "Optica y centro de salud visual. Examen de la vista completo, venta de lentes graduados, lentes de contacto y cirugia de ojos LASIK.",
    address: "Av. Reforma 890, Piso 2",
    city: "Ciudad de Mexico",
    phone: "+52 555 910 1100",
    rating: 4.8,
    reviewCount: 95,
    openNow: true,
    hours: "09:00 - 18:00",
    gradient: "from-blue-500 to-indigo-600",
    accentColor: "bg-blue-50 text-blue-700 border-blue-200",
    tags: ["Examen visual", "Lentes", "Contactos", "LASIK"],
    services: [
      { id: "s1", name: "Examen de la vista", description: "Revision completa con equipo digital", price: 200, duration: 30 },
      { id: "s2", name: "Adaptacion de lentes de contacto", description: "Prueba y eleccion del lente correcto", price: 350, duration: 45 },
      { id: "s3", name: "Tratamiento de ojo seco", description: "Diagnostico y tratamiento especializado", price: 500, duration: 40 },
      { id: "s4", name: "Consulta LASIK", description: "Evaluacion para cirugia refractiva", price: 0, duration: 60 },
    ],
  },
  {
    id: "biz-007",
    name: "Academia de Ingles Plus",
    category: "Educacion",
    categorySlug: "educacion",
    description:
      "Academia de idiomas con metodo comunicativo y maestros nativos. Cursos de ingles, frances y mandarin para adultos y ninos.",
    address: "Calle 5 de Mayo 120",
    city: "Leon",
    phone: "+52 477 200 3000",
    rating: 4.7,
    reviewCount: 134,
    openNow: true,
    hours: "07:00 - 21:00",
    gradient: "from-amber-500 to-yellow-500",
    accentColor: "bg-amber-50 text-amber-700 border-amber-200",
    tags: ["Ingles", "Frances", "Mandarim", "Adultos", "Ninos"],
    services: [
      { id: "s1", name: "Clase de prueba gratuita", description: "Conoce nuestra metodologia sin compromiso", price: 0, duration: 60 },
      { id: "s2", name: "Clase individual 1 hora", description: "Clase personalizada con maestro certificado", price: 280, duration: 60 },
      { id: "s3", name: "Examen de ubicacion", description: "Determina tu nivel actual de idioma", price: 100, duration: 90 },
      { id: "s4", name: "Preparacion TOEFL/IELTS", description: "Curso intensivo para examen internacional", price: 3500, duration: 60 },
    ],
  },
  {
    id: "biz-008",
    name: "FotoArte Estudio",
    category: "Fotografia",
    categorySlug: "fotografia",
    description:
      "Estudio fotografico profesional para sesiones de retrato, familias, embarazo, XV anos, bodas y eventos corporativos.",
    address: "Colonia Polanco, CDMX",
    city: "Ciudad de Mexico",
    phone: "+52 555 333 4400",
    rating: 5.0,
    reviewCount: 67,
    openNow: false,
    hours: "10:00 - 18:00",
    gradient: "from-slate-600 to-slate-800",
    accentColor: "bg-slate-50 text-slate-700 border-slate-200",
    tags: ["Retratos", "Familias", "XV Anos", "Bodas"],
    services: [
      { id: "s1", name: "Sesion de retrato", description: "1 hora, 20 fotos editadas digitalmente", price: 1200, duration: 60 },
      { id: "s2", name: "Sesion familiar", description: "1.5 horas, 35 fotos, sesion en estudio o exterior", price: 1800, duration: 90 },
      { id: "s3", name: "Sesion de embarazo", description: "Sesion especial con accesorios incluidos", price: 1500, duration: 75 },
      { id: "s4", name: "Fotografia de XV Anos", description: "Cobertura completa del evento", price: 8000, duration: 480 },
      { id: "s5", name: "Headshots corporativos", description: "3 looks, fondo neutro, entrega en 24h", price: 900, duration: 45 },
    ],
  },
];

export function getBusinessById(id: string): Business | undefined {
  return BUSINESSES.find((b) => b.id === id);
}

export function getBusinessesByCategory(slug: string): Business[] {
  if (!slug || slug === "todos") return BUSINESSES;
  return BUSINESSES.filter((b) => b.categorySlug === slug);
}
