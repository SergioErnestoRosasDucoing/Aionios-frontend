import {
  HeadphonesIcon,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

type TicketStatus = "open" | "in_progress" | "resolved";
type TicketPriority = "low" | "medium" | "high";

interface Ticket {
  id: string;
  title: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  lastUpdate: string;
  messages: number;
}

const tickets: Ticket[] = [
  {
    id: "TKT-0091",
    title: "No puedo actualizar el logo del negocio",
    category: "Cuenta",
    status: "in_progress",
    priority: "medium",
    createdAt: "26 may 2026",
    lastUpdate: "hace 2 h",
    messages: 3,
  },
  {
    id: "TKT-0090",
    title: "Error al procesar pago con tarjeta VISA",
    category: "Pagos",
    status: "open",
    priority: "high",
    createdAt: "25 may 2026",
    lastUpdate: "hace 5 h",
    messages: 1,
  },
  {
    id: "TKT-0089",
    title: "Solicitud de integracion con Google Calendar",
    category: "Funcionalidad",
    status: "open",
    priority: "low",
    createdAt: "24 may 2026",
    lastUpdate: "hace 1 dia",
    messages: 2,
  },
  {
    id: "TKT-0088",
    title: "Las notificaciones por correo no llegan",
    category: "Notificaciones",
    status: "resolved",
    priority: "medium",
    createdAt: "20 may 2026",
    lastUpdate: "hace 3 dias",
    messages: 5,
  },
  {
    id: "TKT-0087",
    title: "El reporte mensual muestra datos incorrectos",
    category: "Reportes",
    status: "resolved",
    priority: "high",
    createdAt: "18 may 2026",
    lastUpdate: "hace 5 dias",
    messages: 7,
  },
];

const statusConfig: Record<TicketStatus, { label: string; classes: string; icon: React.ReactNode }> = {
  open: {
    label: "Abierto",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock className="w-3 h-3" />,
  },
  in_progress: {
    label: "En proceso",
    classes: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  resolved: {
    label: "Resuelto",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
};

const priorityConfig: Record<TicketPriority, { label: string; dot: string }> = {
  low: { label: "Baja", dot: "bg-slate-400" },
  medium: { label: "Media", dot: "bg-amber-400" },
  high: { label: "Alta", dot: "bg-rose-500" },
};

const faqs = [
  { q: "Como cambio mi correo electronico?", category: "Cuenta" },
  { q: "Como agrego un segundo empleado?", category: "Equipo" },
  { q: "Cuantos servicios puedo crear?", category: "Servicios" },
  { q: "Como configuro pagos en linea?", category: "Pagos" },
  { q: "Puedo usar Aionios en mi telefono?", category: "General" },
];

export default function SupportPage() {
  const open = tickets.filter((t) => t.status !== "resolved").length;
  const resolved = tickets.filter((t) => t.status === "resolved").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Soporte tecnico</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {open} tickets abiertos · {resolved} resueltos
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />
          Nuevo ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets */}
        <div className="lg:col-span-2 space-y-4">
          {/* Busqueda */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar en tickets..."
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>

          {/* Filtros rapidos */}
          <div className="flex gap-2">
            {["Todos", "Abiertos", "En proceso", "Resueltos"].map((f, i) => (
              <button
                key={f}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  i === 0
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Lista de tickets */}
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const s = statusConfig[ticket.status];
              const p = priorityConfig[ticket.priority];
              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-400">{ticket.id}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">{ticket.category}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{ticket.title}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded-full ${s.classes}`}>
                        {s.icon}
                        {s.label}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <div className={`w-2 h-2 rounded-full ${p.dot}`} />
                        {p.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {ticket.messages}
                      </span>
                      <span>{ticket.lastUpdate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Contacto directo */}
          <div className="bg-indigo-600 rounded-2xl p-5 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <HeadphonesIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-semibold mb-1">Soporte prioritario</h3>
            <p className="text-indigo-200 text-xs mb-4">
              Nuestro equipo esta disponible de lunes a viernes de 9:00 a 18:00 hrs.
            </p>
            <button className="w-full py-2 bg-white text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer">
              Iniciar chat en vivo
            </button>
          </div>

          {/* Preguntas frecuentes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Preguntas frecuentes</h3>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <button
                  key={i}
                  className="w-full flex items-start justify-between gap-2 p-3 rounded-xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-700 group-hover:text-indigo-700 transition-colors">
                      {faq.q}
                    </p>
                    <span className="text-xs text-slate-400">{faq.category}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Tiempo de respuesta */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Tiempo de respuesta</h3>
            <div className="space-y-2">
              {[
                { label: "Prioridad alta", time: "< 2 horas", dot: "bg-rose-500" },
                { label: "Prioridad media", time: "< 8 horas", dot: "bg-amber-400" },
                { label: "Prioridad baja", time: "< 24 horas", dot: "bg-slate-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.dot}`} />
                    <span className="text-xs text-slate-600">{item.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
