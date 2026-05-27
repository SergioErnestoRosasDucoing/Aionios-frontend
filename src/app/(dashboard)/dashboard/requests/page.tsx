"use client";

import { useState, useEffect, type JSX } from "react";
import {
  ClipboardList,
  Check,
  X,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";
import { requestsService } from "@/services/requests.service";
import { servicesService } from "@/services/services.service";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import type { Solicitud, EstadoSolicitud } from "@/types/request.types";
import type { Service } from "@/types/service.types";

const statusConfig: Record<EstadoSolicitud, { label: string; classes: string; icon: JSX.Element }> = {
  PENDIENTE: {
    label: "Pendiente",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock className="w-3 h-3" />,
  },
  CONFIRMADA: {
    label: "Confirmada",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  CANCELADA: {
    label: "Cancelada",
    classes: "bg-rose-50 text-rose-700 border-rose-200",
    icon: <XCircle className="w-3 h-3" />,
  },
};

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function formatHora(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

export default function RequestsPage() {
  const { business, loading: bizLoading } = useMyBusiness();
  const [requests, setRequests] = useState<Solicitud[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (bizLoading) return;
    if (!business) { setLoading(false); return; }

    Promise.all([
      requestsService.getByNegocio(business.id),
      servicesService.getByBusiness(business.id),
    ])
      .then(([reqs, svcs]) => {
        setRequests(reqs);
        setServices(svcs);
      })
      .catch(() => setError("No se pudieron cargar las solicitudes."))
      .finally(() => setLoading(false));
  }, [business, bizLoading]);

  const serviceNameFor = (mongoId: string) =>
    services.find((s) => s._id === mongoId)?.nombre ?? mongoId;

  const handleEstado = async (id: number, estado: EstadoSolicitud) => {
    setUpdating(id);
    try {
      const updated = await requestsService.updateEstado(id, estado);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, estado: updated.estado } : r)));
    } catch {
      // silently ignore
    } finally {
      setUpdating(null);
    }
  };

  const filtered = requests.filter((r) => {
    const name = `${r.usuario.nombre} ${r.usuario.apellido}`.toLowerCase();
    return !search || name.includes(search.toLowerCase());
  });

  const counts = requests.reduce(
    (acc, r) => {
      if (r.estado === "PENDIENTE") acc.PENDIENTE++;
      else if (r.estado === "CONFIRMADA") acc.CONFIRMADA++;
      else if (r.estado === "CANCELADA") acc.CANCELADA++;
      return acc;
    },
    { PENDIENTE: 0, CONFIRMADA: 0, CANCELADA: 0 },
  );

  if (bizLoading || loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-8 w-56 bg-slate-200 rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Solicitudes y citas</h1>
        <p className="text-slate-500 text-sm mt-0.5">Gestiona las reservas entrantes de clientes</p>
      </div>

      {!business && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
          No tienes un negocio registrado. Crea uno desde <strong>Mi negocio</strong>.
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">{error}</div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pendientes",  count: counts.PENDIENTE,  color: "border-amber-200 bg-amber-50",    text: "text-amber-700" },
          { label: "Confirmadas", count: counts.CONFIRMADA, color: "border-emerald-200 bg-emerald-50", text: "text-emerald-700" },
          { label: "Canceladas",  count: counts.CANCELADA,  color: "border-rose-200 bg-rose-50",       text: "text-rose-700" },
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ClipboardList className="w-4 h-4" />
            {filtered.length} solicitud{filtered.length !== 1 ? "es" : ""}
          </div>
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 py-16 text-sm">
            {requests.length === 0 ? "Aun no hay solicitudes para este negocio." : "Sin resultados."}
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((req) => {
              const s = statusConfig[req.estado];
              const isUpdating = updating === req.id;
              return (
                <div key={req.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  {/* Info cliente */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {req.usuario.nombre} {req.usuario.apellido}
                      </p>
                      <span className="text-xs text-slate-400">#{req.id}</span>
                    </div>
                    <p className="text-xs text-slate-600">{serviceNameFor(req.id_servicio_nosql)}</p>
                    {req.usuario.telefono && (
                      <p className="text-xs text-slate-400 mt-0.5">{req.usuario.telefono}</p>
                    )}
                  </div>

                  {/* Fecha y hora */}
                  <div className="hidden sm:block text-center min-w-[110px]">
                    <p className="text-xs font-semibold text-slate-700">{formatFecha(req.fecha_hora_propuesta)}</p>
                    <p className="text-xs text-slate-500">{formatHora(req.fecha_hora_propuesta)}</p>
                  </div>

                  {/* Estado */}
                  <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2.5 py-1 rounded-full flex-shrink-0 ${s.classes}`}>
                    {s.icon}
                    {s.label}
                  </span>

                  {/* Acciones */}
                  {req.estado === "PENDIENTE" && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleEstado(req.id, "CONFIRMADA")}
                        disabled={isUpdating}
                        className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                        title="Aceptar"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEstado(req.id, "CANCELADA")}
                        disabled={isUpdating}
                        className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                        title="Rechazar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {req.estado !== "PENDIENTE" && (
                    <div className="w-[68px] flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 px-1">Mostrando {filtered.length} solicitudes</p>
    </div>
  );
}
