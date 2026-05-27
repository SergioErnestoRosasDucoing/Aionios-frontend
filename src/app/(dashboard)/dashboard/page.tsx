"use client";

import { useEffect, useState, type JSX } from "react";
import {
  CalendarCheck, Users, DollarSign, Star,
  TrendingUp, Clock, CheckCircle, XCircle, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { requestsService } from "@/services/requests.service";
import { reviewsService } from "@/services/reviews.service";
import { paymentsService } from "@/services/payments.service";
import { servicesService } from "@/services/services.service";
import type { Solicitud } from "@/types/request.types";
import type { Review } from "@/types/review.types";
import type { Pago } from "@/types/payment.types";
import type { Service } from "@/types/service.types";

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

function getWeekStart(): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const d = new Date(today);
  d.setDate(today.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function isSameWeek(iso: string): boolean {
  const ws = getWeekStart();
  const we = new Date(ws); we.setDate(ws.getDate() + 6); we.setHours(23, 59, 59);
  const d = new Date(iso);
  return d >= ws && d <= we;
}

type ActivityType = "confirmed" | "new" | "cancelled" | "payment" | "review";

interface ActivityItem {
  type: ActivityType;
  message: string;
  ts: number;
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

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1)  return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24)   return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} día${Math.floor(h / 24) > 1 ? "s" : ""}`;
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { business, loading: bizLoading } = useMyBusiness();

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bizLoading) return;
    if (!business) { setLoading(false); return; }

    Promise.all([
      requestsService.getByNegocio(business.id),
      reviewsService.getByNegocio(business.id),
      paymentsService.getByNegocio(business.id),
      servicesService.getByBusiness(business.id),
    ])
      .then(([reqs, revs, pays, svcs]) => {
        setSolicitudes(reqs);
        setReviews(revs);
        setPagos(pays);
        setServices(svcs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [business, bizLoading]);

  const today = new Intl.DateTimeFormat("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).format(new Date());

  const greeting = business?.nombre
    ? `Bienvenido, ${business.nombre}`
    : user?.nombre
    ? `Bienvenido, ${user.nombre}`
    : "Panel principal";

  // KPIs
  const citasHoy = solicitudes.filter((s) => isToday(s.fecha_hora_propuesta)).length;

  const clientesUnicos = new Set(
    solicitudes
      .filter((s) => isSameWeek(s.fecha_hora_propuesta))
      .map((s) => s.id_usuario)
  ).size;

  const ingresosSemanales = pagos
    .filter((p) => p.estado_pago === "COMPLETADO" && isSameWeek(p.cita.fecha_hora_propuesta))
    .reduce((sum, p) => sum + parseFloat(p.monto), 0);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  // Barchart: solicitudes por día esta semana
  const ws = getWeekStart();
  const barData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws); d.setDate(ws.getDate() + i);
    const count = solicitudes.filter((s) => {
      return new Date(s.fecha_hora_propuesta).toDateString() === d.toDateString();
    }).length;
    return { label: DAY_LABELS[i], count };
  });
  const maxBar = Math.max(...barData.map((d) => d.count), 1);

  // Citas de hoy
  const todayCitas = solicitudes
    .filter((s) => isToday(s.fecha_hora_propuesta) && s.estado !== "CANCELADA")
    .sort((a, b) => new Date(a.fecha_hora_propuesta).getTime() - new Date(b.fecha_hora_propuesta).getTime());

  const serviceNameFor = (mongoId: string) =>
    services.find((s) => s._id === mongoId)?.nombre ?? "Servicio";

  // Actividad reciente: últimas solicitudes + reseñas mezcladas por "proximidad temporal"
  const activity: ActivityItem[] = [
    ...solicitudes.slice(0, 10).map((s): ActivityItem => {
      const name = `${s.usuario.nombre} ${s.usuario.apellido}`;
      if (s.estado === "CONFIRMADA") return { type: "confirmed", message: `Cita confirmada con ${name}`, ts: new Date(s.fecha_hora_propuesta).getTime() };
      if (s.estado === "CANCELADA")  return { type: "cancelled", message: `Cita cancelada de ${name}`, ts: new Date(s.fecha_hora_propuesta).getTime() };
      return { type: "new", message: `Nueva solicitud de ${name}`, ts: new Date(s.fecha_hora_propuesta).getTime() };
    }),
    ...reviews.slice(0, 5).map((r): ActivityItem => ({
      type: "review",
      message: `Nueva reseña de ${r.rating}★ de ${r.nombre_cliente ?? `Cliente #${r.usuario_id}`}`,
      ts: new Date(r.createdAt ?? r.fecha).getTime(),
    })),
    ...pagos.filter((p) => p.estado_pago === "COMPLETADO").slice(0, 5).map((p): ActivityItem => ({
      type: "payment",
      message: `Pago de $${parseFloat(p.monto).toLocaleString()} recibido — ${p.metodo_pago}`,
      ts: new Date(p.cita.fecha_hora_propuesta).getTime(),
    })),
  ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 6);

  const kpis = [
    { label: "Citas hoy",              value: loading ? "—" : String(citasHoy),                       sub: "Para hoy",                        icon: CalendarCheck, color: "bg-indigo-50 text-indigo-600",  border: "border-indigo-100"  },
    { label: "Clientes esta semana",   value: loading ? "—" : String(clientesUnicos),                  sub: "Únicos con cita esta semana",     icon: Users,         color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
    { label: "Ingresos semanales",     value: loading ? "—" : `$${ingresosSemanales.toLocaleString()}`, sub: "Pagos completados esta semana",   icon: DollarSign,    color: "bg-amber-50 text-amber-600",    border: "border-amber-100"   },
    { label: "Satisfacción promedio",  value: loading ? "—" : avgRating,                               sub: `${reviews.length} reseña${reviews.length !== 1 ? "s" : ""}`, icon: Star, color: "bg-violet-50 text-violet-600", border: "border-violet-100" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting}</h1>
          <p className="text-slate-500 text-sm mt-0.5 capitalize">{today}</p>
        </div>
        <Link
          href="/dashboard/horarios"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <CalendarCheck className="w-4 h-4" />
          Ver agenda
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`bg-white rounded-2xl border ${kpi.border} p-5 flex flex-col gap-3`}>
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
                <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
              </div>
              <p className="text-xs text-slate-400">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Gráfica + Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica semanal de citas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Citas esta semana</h2>
              <p className="text-slate-500 text-sm">Distribución por día (pendientes + confirmadas)</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
              {solicitudes.filter((s) => isSameWeek(s.fecha_hora_propuesta)).length} total
            </span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {barData.map((d, i) => {
              const isToday = new Date().getDay() === (i + 1) % 7;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-lg transition-all ${isToday ? "bg-indigo-600" : "bg-slate-100 hover:bg-indigo-200"}`}
                    style={{ height: `${(d.count / maxBar) * 100}%`, minHeight: d.count > 0 ? "6px" : "0" }}
                  />
                  <span className="text-xs text-slate-400 font-medium">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Actividad reciente</h2>
          </div>
          {activity.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Sin actividad reciente.</p>
          ) : (
            <div className="space-y-4">
              {activity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${activityStyles[item.type]}`}>
                    {activityIcons[item.type]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-700 leading-relaxed">{item.message}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{timeAgo(item.ts)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Citas de hoy */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Citas de hoy</h2>
            <p className="text-slate-500 text-sm">{todayCitas.length} cita{todayCitas.length !== 1 ? "s" : ""} programada{todayCitas.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/dashboard/horarios" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Ver agenda completa
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {todayCitas.length === 0 ? (
          <div className="text-center py-10">
            <CalendarCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No tienes citas programadas para hoy</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayCitas.map((cita) => (
              <div key={cita.id} className="flex items-center gap-4 py-3">
                <div className="text-center min-w-[52px]">
                  <p className="text-sm font-bold text-indigo-600">{formatHora(cita.fecha_hora_propuesta)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{cita.usuario.nombre} {cita.usuario.apellido}</p>
                  <p className="text-xs text-slate-500 truncate">{serviceNameFor(cita.id_servicio_nosql)}</p>
                </div>
                {cita.estado === "CONFIRMADA" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-shrink-0">
                    <CheckCircle className="w-3 h-3" /> Confirmada
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">
                    <Clock className="w-3 h-3" /> Pendiente
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
