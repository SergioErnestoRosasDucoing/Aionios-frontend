import type { JSX } from "react";
import {
  ClipboardList,
  Check,
  X,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
} from "lucide-react";

type RequestStatus = "pending" | "confirmed" | "cancelled" | "rescheduled";

interface Request {
  id: string;
  client: string;
  service: string;
  requestedDate: string;
  requestedTime: string;
  duration: string;
  price: number;
  status: RequestStatus;
  phone: string;
  note?: string;
}

const requests: Request[] = [
  {
    id: "REQ-001",
    client: "Fernanda Reyes",
    service: "Tinte completo",
    requestedDate: "27 may 2026",
    requestedTime: "10:00",
    duration: "2 h",
    price: 850,
    status: "pending",
    phone: "+52 555 234 5678",
    note: "Prefiere color chocolate oscuro",
  },
  {
    id: "REQ-002",
    client: "Diego Morales",
    service: "Corte caballero",
    requestedDate: "27 may 2026",
    requestedTime: "12:30",
    duration: "45 min",
    price: 200,
    status: "pending",
    phone: "+52 555 345 6789",
  },
  {
    id: "REQ-003",
    client: "Valeria Gutierrez",
    service: "Manicure y pedicure",
    requestedDate: "28 may 2026",
    requestedTime: "11:00",
    duration: "1.5 h",
    price: 380,
    status: "confirmed",
    phone: "+52 555 456 7890",
  },
  {
    id: "REQ-004",
    client: "Marco Jimenez",
    service: "Tratamiento capilar",
    requestedDate: "28 may 2026",
    requestedTime: "14:00",
    duration: "1 h",
    price: 420,
    status: "cancelled",
    phone: "+52 555 567 8901",
    note: "Cancelo por viaje",
  },
  {
    id: "REQ-005",
    client: "Isabela Vargas",
    service: "Brushing y peinado",
    requestedDate: "29 may 2026",
    requestedTime: "09:30",
    duration: "35 min",
    price: 200,
    status: "rescheduled",
    phone: "+52 555 678 9012",
  },
  {
    id: "REQ-006",
    client: "Andres Flores",
    service: "Corte y barba",
    requestedDate: "30 may 2026",
    requestedTime: "16:00",
    duration: "1 h",
    price: 280,
    status: "pending",
    phone: "+52 555 789 0123",
  },
];

const statusConfig: Record<RequestStatus, { label: string; classes: string; icon: JSX.Element }> = {
  pending: {
    label: "Pendiente",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock className="w-3 h-3" />,
  },
  confirmed: {
    label: "Confirmada",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelada",
    classes: "bg-rose-50 text-rose-700 border-rose-200",
    icon: <XCircle className="w-3 h-3" />,
  },
  rescheduled: {
    label: "Reprogramada",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <RotateCcw className="w-3 h-3" />,
  },
};

// Single pass — avoids iterating the array 3 times
const counts = requests.reduce(
  (acc, r) => {
    if (r.status === "pending" || r.status === "confirmed" || r.status === "cancelled") {
      acc[r.status]++;
    }
    return acc;
  },
  { pending: 0, confirmed: 0, cancelled: 0 },
);

export default function RequestsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Solicitudes y citas</h1>
        <p className="text-slate-500 text-sm mt-0.5">Gestiona las reservas entrantes de clientes</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pendientes", count: counts.pending, color: "border-amber-200 bg-amber-50", text: "text-amber-700" },
          { label: "Confirmadas", count: counts.confirmed, color: "border-emerald-200 bg-emerald-50", text: "text-emerald-700" },
          { label: "Canceladas", count: counts.cancelled, color: "border-rose-200 bg-rose-50", text: "text-rose-700" },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl border p-4 ${item.color}`}>
            <p className={`text-2xl font-bold ${item.text}`}>{item.count}</p>
            <p className={`text-sm font-medium mt-0.5 ${item.text} opacity-80`}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>

        {/* Lista */}
        <div className="divide-y divide-slate-100">
          {requests.map((req) => {
            const s = statusConfig[req.status];
            return (
              <div key={req.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                {/* Info cliente */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-slate-900">{req.client}</p>
                    <span className="text-xs text-slate-400">{req.id}</span>
                  </div>
                  <p className="text-xs text-slate-600">{req.service}</p>
                  {req.note && (
                    <p className="text-xs text-slate-400 italic mt-0.5">{req.note}</p>
                  )}
                </div>

                {/* Fecha y hora */}
                <div className="hidden sm:block text-center min-w-[100px]">
                  <p className="text-xs font-semibold text-slate-700">{req.requestedDate}</p>
                  <p className="text-xs text-slate-500">{req.requestedTime} — {req.duration}</p>
                </div>

                {/* Precio */}
                <div className="hidden md:block text-right min-w-[70px]">
                  <p className="text-sm font-bold text-slate-900">${req.price}</p>
                </div>

                {/* Estado */}
                <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2.5 py-1 rounded-full flex-shrink-0 ${s.classes}`}>
                  {s.icon}
                  {s.label}
                </span>

                {/* Acciones */}
                {req.status === "pending" && (
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors cursor-pointer" title="Aceptar">
                      <Check className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer" title="Rechazar">
                      <X className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer" title="Reprogramar">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {req.status !== "pending" && (
                  <div className="w-[92px] flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <p>Mostrando {requests.length} solicitudes</p>
        <div className="flex gap-1">
          <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">Anterior</button>
          <button className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white cursor-pointer">1</button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">2</button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">Siguiente</button>
        </div>
      </div>
    </div>
  );
}
