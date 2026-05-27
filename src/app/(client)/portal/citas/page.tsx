"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays, Plus, Clock, CheckCircle, XCircle,
  MapPin, ChevronRight, Loader2,
} from "lucide-react";
import { requestsService } from "@/services/requests.service";
import { servicesService } from "@/services/services.service";
import type { SolicitudCliente } from "@/types/request.types";
import type { Service } from "@/types/service.types";

const ESTADO_CONFIG = {
  PENDIENTE:  { label: "Pendiente",  icon: Clock,          cls: "text-amber-700 bg-amber-50 border-amber-200"  },
  CONFIRMADA: { label: "Confirmada", icon: CheckCircle,     cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  CANCELADA:  { label: "Cancelada",  icon: XCircle,        cls: "text-rose-700 bg-rose-50 border-rose-200"     },
} as const;

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function isUpcoming(iso: string) {
  return new Date(iso) >= new Date();
}

export default function CitasPage() {
  const [citas, setCitas] = useState<SolicitudCliente[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"proximas" | "pasadas">("proximas");

  useEffect(() => {
    Promise.all([
      requestsService.getMine(),
      servicesService.getAll(),
    ])
      .then(([reqs, svcs]) => {
        setCitas(reqs);
        setServices(svcs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const serviceNameFor = (mongoId: string) =>
    services.find((s) => s._id === mongoId)?.nombre ?? "Servicio";

  const proximas = citas.filter((c) => isUpcoming(c.fecha_hora_propuesta) && c.estado !== "CANCELADA");
  const pasadas  = citas.filter((c) => !isUpcoming(c.fecha_hora_propuesta) || c.estado === "CANCELADA");

  const displayed = tab === "proximas" ? proximas : pasadas;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis citas</h1>
          <p className="text-slate-500 text-sm mt-0.5">Historial y próximas citas agendadas</p>
        </div>
        <Link
          href="/portal/explorar"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva cita
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["proximas", "pasadas"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "proximas" ? `Próximas (${proximas.length})` : `Pasadas (${pasadas.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
          <CalendarDays className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-700 font-semibold text-base">
            {tab === "proximas" ? "No tienes citas próximas" : "Sin historial de citas"}
          </p>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            {tab === "proximas"
              ? "Cuando agendes una cita con algún negocio, aparecerá aquí."
              : "Tus citas pasadas y canceladas aparecerán aquí."}
          </p>
          {tab === "proximas" && (
            <Link
              href="/portal/explorar"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Explorar negocios
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((cita) => {
            const cfg = ESTADO_CONFIG[cita.estado];
            const Icon = cfg.icon;
            return (
              <div
                key={cita.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4"
              >
                {/* Date block */}
                <div className="text-center min-w-[52px] flex-shrink-0">
                  <p className="text-2xl font-bold text-indigo-600 leading-none">
                    {new Date(cita.fecha_hora_propuesta).getDate()}
                  </p>
                  <p className="text-xs text-slate-500 uppercase mt-0.5">
                    {new Date(cita.fecha_hora_propuesta).toLocaleDateString("es-MX", { month: "short" })}
                  </p>
                </div>

                <div className="w-px h-12 bg-slate-100 flex-shrink-0" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{cita.negocio.nombre}</p>
                  <p className="text-xs text-slate-500 truncate">{serviceNameFor(cita.id_servicio_nosql)}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatHora(cita.fecha_hora_propuesta)} — {formatFecha(cita.fecha_hora_propuesta)}
                    </span>
                    {cita.negocio.direccion && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {cita.negocio.direccion}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status + link */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded-full ${cfg.cls}`}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                  <Link
                    href={`/portal/negocio/${cita.id_negocio}`}
                    className="inline-flex items-center gap-0.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Ver negocio <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
