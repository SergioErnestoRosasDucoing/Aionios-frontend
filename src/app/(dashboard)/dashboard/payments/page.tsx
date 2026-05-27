"use client";

import { useState, useEffect, type JSX } from "react";
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
} from "lucide-react";
import { paymentsService } from "@/services/payments.service";
import { servicesService } from "@/services/services.service";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import type { Pago, EstadoPago } from "@/types/payment.types";
import type { Service } from "@/types/service.types";

const statusConfig: Record<EstadoPago, { label: string; classes: string; icon: JSX.Element }> = {
  COMPLETADO: {
    label: "Completado",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  PENDIENTE: {
    label: "Pendiente",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock className="w-3 h-3" />,
  },
  FALLIDO: {
    label: "Fallido",
    classes: "bg-rose-50 text-rose-700 border-rose-200",
    icon: <XCircle className="w-3 h-3" />,
  },
  REEMBOLSADO: {
    label: "Reembolsado",
    classes: "bg-violet-50 text-violet-700 border-violet-200",
    icon: <RefreshCw className="w-3 h-3" />,
  },
};

const methodColor: Record<string, string> = {
  Tarjeta: "bg-indigo-50 text-indigo-700",
  Efectivo: "bg-emerald-50 text-emerald-700",
  Transferencia: "bg-violet-50 text-violet-700",
};

const DAY_LABELS = ["D", "L", "M", "X", "J", "V", "S"];

function getWeekStart(): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(today);
  start.setDate(today.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function buildWeekData(pagos: Pago[]): { label: string; amount: number }[] {
  const weekStart = getWeekStart();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  return days.map((d, i) => {
    const amount = pagos
      .filter((p) => {
        if (p.estado_pago !== "COMPLETADO") return false;
        const pDate = new Date(p.cita.fecha_hora_propuesta);
        return pDate.toDateString() === d.toDateString();
      })
      .reduce((sum, p) => sum + parseFloat(p.monto), 0);
    return { label: DAY_LABELS[(i + 1) % 7], amount };
  });
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

export default function PaymentsPage() {
  const { business, loading: bizLoading } = useMyBusiness();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (bizLoading) return;
    if (!business) { setLoading(false); return; }

    Promise.all([
      paymentsService.getByNegocio(business.id),
      servicesService.getByBusiness(business.id),
    ])
      .then(([pays, svcs]) => {
        setPagos(pays);
        setServices(svcs);
      })
      .catch(() => setError("No se pudieron cargar los pagos."))
      .finally(() => setLoading(false));
  }, [business, bizLoading]);

  const serviceNameFor = (mongoId: string) =>
    services.find((s) => s._id === mongoId)?.nombre ?? "Servicio";

  const filtered = pagos.filter((p) => {
    const name = `${p.cita.usuario.nombre} ${p.cita.usuario.apellido}`.toLowerCase();
    return !search || name.includes(search.toLowerCase());
  });

  const completed = pagos.filter((p) => p.estado_pago === "COMPLETADO");
  const completedTotal = completed.reduce((s, p) => s + parseFloat(p.monto), 0);
  const avgPerVisit = completed.length > 0 ? Math.round(completedTotal / completed.length) : 0;

  const weekData = buildWeekData(pagos);
  const weekTotal = weekData.reduce((s, d) => s + d.amount, 0);
  const maxAmount = Math.max(...weekData.map((d) => d.amount), 1);

  if (bizLoading || loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-8 w-56 bg-slate-200 rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-80 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historial de pagos</h1>
          <p className="text-slate-500 text-sm mt-0.5">Resumen financiero y transacciones recientes</p>
        </div>
      </div>

      {!business && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
          No tienes un negocio registrado. Crea uno desde <strong>Mi negocio</strong>.
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">{error}</div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Ingresos esta semana",
            value: `$${weekTotal.toLocaleString()}`,
            sub: `${weekData.filter((d) => d.amount > 0).length} días con actividad`,
            icon: DollarSign,
            color: "bg-emerald-50 text-emerald-600",
            border: "border-emerald-100",
          },
          {
            label: "Transacciones completadas",
            value: `$${completedTotal.toLocaleString()}`,
            sub: `${completed.length} transacciones`,
            icon: CheckCircle,
            color: "bg-indigo-50 text-indigo-600",
            border: "border-indigo-100",
          },
          {
            label: "Promedio por visita",
            value: `$${avgPerVisit.toLocaleString()}`,
            sub: "Basado en visitas completadas",
            icon: TrendingUp,
            color: "bg-violet-50 text-violet-600",
            border: "border-violet-100",
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`bg-white rounded-2xl border ${kpi.border} p-5`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
              <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de transacciones */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
              />
            </div>
            <span className="text-xs text-slate-400">{filtered.length} registros</span>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-16 text-sm">
              {pagos.length === 0 ? "Aún no hay pagos registrados." : "Sin resultados."}
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((pay) => {
                const s = statusConfig[pay.estado_pago];
                return (
                  <div key={pay.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {pay.cita.usuario.nombre} {pay.cita.usuario.apellido}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {serviceNameFor(pay.cita.id_servicio_nosql)}
                      </p>
                    </div>
                    <div className="hidden sm:block text-center">
                      <p className="text-xs text-slate-500">{formatFecha(pay.cita.fecha_hora_propuesta)}</p>
                      <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${methodColor[pay.metodo_pago] ?? "bg-slate-100 text-slate-600"}`}>
                        {pay.metodo_pago}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 min-w-[60px] text-right">
                      ${parseFloat(pay.monto).toLocaleString()}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded-full flex-shrink-0 ${s.classes}`}>
                      {s.icon}
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gráfica semanal */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Ingresos por día</h2>
          <p className="text-xs text-slate-500 mb-5">Esta semana (pagos completados)</p>
          <div className="flex items-end gap-2 h-40 mb-3">
            {weekData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-lg bg-indigo-100 hover:bg-indigo-400 transition-colors"
                  style={{ height: `${(d.amount / maxAmount) * 100}%`, minHeight: d.amount > 0 ? "4px" : "0" }}
                />
                <span className="text-xs text-slate-400 font-medium">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Total semana</span>
              <span className="text-sm font-bold text-slate-900">${weekTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
