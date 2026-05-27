import type { JSX } from "react";
import {
  CalendarCheck,
  Users,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
} from "lucide-react";

const kpis = [
  {
    label: "Citas hoy",
    value: "12",
    change: "+3 vs ayer",
    trend: "up",
    icon: CalendarCheck,
    color: "bg-indigo-50 text-indigo-600",
    border: "border-indigo-100",
  },
  {
    label: "Nuevos clientes",
    value: "4",
    change: "+2 esta semana",
    trend: "up",
    icon: Users,
    color: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-100",
  },
  {
    label: "Ingresos semanales",
    value: "$4,200",
    change: "+12% vs semana anterior",
    trend: "up",
    icon: DollarSign,
    color: "bg-amber-50 text-amber-600",
    border: "border-amber-100",
  },
  {
    label: "Satisfaccion promedio",
    value: "4.8",
    change: "Basado en 38 resenas",
    trend: "neutral",
    icon: Star,
    color: "bg-violet-50 text-violet-600",
    border: "border-violet-100",
  },
];

const appointments: Array<{ time: string; client: string; service: string; status: AppointmentStatus }> = [
  { time: "09:00", client: "Maria Lopez",   service: "Corte y peinado",    status: "confirmed" },
  { time: "10:30", client: "Carlos Ramirez", service: "Tinte completo",    status: "confirmed" },
  { time: "12:00", client: "Sofia Torres",   service: "Manicure",          status: "pending"   },
  { time: "14:00", client: "Ana Mendez",     service: "Corte caballero",   status: "confirmed" },
  { time: "15:30", client: "Luis Herrera",   service: "Tratamiento capilar", status: "pending" },
];

const recentActivity: Array<{ type: ActivityType; message: string; time: string }> = [
  { type: "confirmed", message: "Cita confirmada con Maria Lopez para las 09:00",  time: "hace 10 min"  },
  { type: "new",       message: "Nueva solicitud de cita de Pedro Sanchez",        time: "hace 25 min"  },
  { type: "cancelled", message: "Cita cancelada: Roberto Diaz (11:00)",            time: "hace 1 hora"  },
  { type: "payment",   message: "Pago recibido de $350 — Tinte completo",          time: "hace 2 horas" },
  { type: "review",    message: "Nueva resena de 5 estrellas de Laura Castillo",   time: "hace 3 horas" },
];

const barHeights = [40, 65, 50, 80, 70, 90, 60];
const barDays = ["L", "M", "X", "J", "V", "S", "D"];

type AppointmentStatus = "confirmed" | "pending";
type ActivityType = "confirmed" | "new" | "cancelled" | "payment" | "review";

function StatusBadge({ status }: { status: AppointmentStatus }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
        <CheckCircle className="w-3 h-3" />
        Confirmada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <Clock className="w-3 h-3" />
      Pendiente
    </span>
  );
}

const activityStyles: Record<ActivityType, string> = {
  confirmed: "bg-emerald-100 text-emerald-600",
  new:       "bg-indigo-100 text-indigo-600",
  cancelled: "bg-rose-100 text-rose-600",
  payment:   "bg-amber-100 text-amber-600",
  review:    "bg-violet-100 text-violet-600",
};

const activityIcons: Record<ActivityType, JSX.Element> = {
  confirmed: <CheckCircle className="w-3.5 h-3.5" />,
  new:       <CalendarCheck className="w-3.5 h-3.5" />,
  cancelled: <XCircle className="w-3.5 h-3.5" />,
  payment:   <DollarSign className="w-3.5 h-3.5" />,
  review:    <Star className="w-3.5 h-3.5" />,
};

function ActivityIcon({ type }: { type: ActivityType }) {
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${activityStyles[type]}`}>
      {activityIcons[type]}
    </div>
  );
}

export default function DashboardPage() {
  const today = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel principal</h1>
          <p className="text-slate-500 text-sm mt-0.5 capitalize">{today}</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
          <CalendarCheck className="w-4 h-4" />
          Nueva cita
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`bg-white rounded-2xl border ${kpi.border} p-5 flex flex-col gap-3`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {kpi.trend === "up" && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
                <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
              </div>
              <p className="text-xs text-slate-400">{kpi.change}</p>
            </div>
          );
        })}
      </div>

      {/* Contenido principal — 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafica semanal */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Citas esta semana</h2>
              <p className="text-slate-500 text-sm">Actividad de los ultimos 7 dias</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              +18% vs semana anterior
            </span>
          </div>

          {/* Grafica de barras simple */}
          <div className="flex items-end gap-3 h-40">
            {barHeights.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-lg transition-all ${i === 5 ? "bg-indigo-600" : "bg-slate-100 hover:bg-indigo-200"}`}
                  style={{ height: `${h}%` }}
                />
                <span className="text-xs text-slate-400 font-medium">{barDays[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Actividad reciente</h2>
            <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
              Ver todo
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <ActivityIcon type={item.type} />
                <div className="min-w-0">
                  <p className="text-xs text-slate-700 leading-relaxed">{item.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Citas de hoy */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Citas de hoy</h2>
            <p className="text-slate-500 text-sm">{appointments.length} citas programadas</p>
          </div>
          <button className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
            Ver agenda completa
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {appointments.map((apt, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-center w-14">
                  <p className="text-sm font-bold text-slate-900">{apt.time}</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{apt.client}</p>
                  <p className="text-xs text-slate-500">{apt.service}</p>
                </div>
              </div>
              <StatusBadge status={apt.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
