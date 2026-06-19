"use client";

import { useState, useEffect, useCallback, type JSX } from "react";
import {
  ClipboardList, Clock, CheckCircle, XCircle,
  Search, X, Mail, Phone, User, CalendarDays,
  MessageSquare, Check, Scissors,
} from "lucide-react";
import { requestsService } from "@/services/requests.service";
import { servicesService } from "@/services/services.service";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { useAuth } from "@/context/AuthContext";
import RequestChat from "@/components/ui/RequestChat";
import type { Solicitud, EstadoSolicitud } from "@/types/request.types";
import type { Service } from "@/types/service.types";

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusConfig: Record<EstadoSolicitud, { label: string; classes: string; icon: JSX.Element }> = {
  PENDIENTE:  { label: "Pendiente",  classes: "bg-amber-50 text-amber-700 border-amber-200",        icon: <Clock className="w-3 h-3" />       },
  CONFIRMADA: { label: "Confirmada", classes: "bg-emerald-50 text-emerald-700 border-emerald-200",  icon: <CheckCircle className="w-3 h-3" /> },
  CANCELADA:  { label: "Cancelada",  classes: "bg-rose-50 text-rose-700 border-rose-200",            icon: <XCircle className="w-3 h-3" />    },
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}
function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}
function formatFechaLarga(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function isAConvenir(svc: Service | undefined) {
  return svc?.unidadDuracion === "a_convenir";
}

const FILTROS: { label: string; value: EstadoSolicitud | "TODAS" }[] = [
  { label: "Todas",      value: "TODAS"     },
  { label: "Pendientes", value: "PENDIENTE" },
  { label: "Confirmadas",value: "CONFIRMADA"},
  { label: "Canceladas", value: "CANCELADA" },
];

// ── Modal de detalle ──────────────────────────────────────────────────────────
function DetailModal({
  req, svc, negocioUserId, negocioNombre,
  onClose, onConfirm, onCancel,
}: {
  req: Solicitud;
  svc: Service | undefined;
  negocioUserId: number;
  negocioNombre: string;
  onClose:   () => void;
  onConfirm: (id: number) => Promise<void>;
  onCancel:  (id: number) => Promise<void>;
}) {
  const [tab,    setTab]    = useState<"info" | "chat">("info");
  const [acting, setActing] = useState(false);
  const convenir = isAConvenir(svc);
  const s = statusConfig[req.estado];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handle = async (action: "confirm" | "cancel") => {
    setActing(true);
    try {
      if (action === "confirm") await onConfirm(req.id);
      else await onCancel(req.id);
      onClose();
    } catch { /* silencioso */ }
    finally { setActing(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">

        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.classes}`}>
              {s.icon} {s.label}
            </span>
            <span className="text-xs text-slate-400">#{req.id}</span>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Tabs (solo si a_convenir) */}
        {convenir && (
          <div className="flex border-b border-slate-100 flex-shrink-0">
            {(["info", "chat"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === t ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "chat" && <MessageSquare className="w-3.5 h-3.5" />}
                {t === "info" ? "Detalles" : "Coordinar"}
              </button>
            ))}
          </div>
        )}

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {tab === "info" ? (
            <>
              {/* Servicio */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Scissors className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Servicio</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{svc?.nombre ?? "Servicio"}</p>
                {svc?.descripcion && <p className="text-xs text-slate-500">{svc.descripcion}</p>}
                <div className="flex gap-4 pt-1">
                  {svc?.precio != null && (
                    <span className="text-xs text-slate-600">
                      💰 <strong>${Number(svc.precio).toLocaleString()}</strong>
                    </span>
                  )}
                  {svc?.duracion != null && !convenir && (
                    <span className="text-xs text-slate-600">
                      ⏱ <strong>{svc.duracion} {svc.unidadDuracion}</strong>
                    </span>
                  )}
                  {convenir && (
                    <span className="text-xs text-amber-600 font-medium">⏳ Duración a convenir</span>
                  )}
                </div>
              </div>

              {/* Fecha y hora */}
              {!convenir && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Fecha y hora</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 capitalize">{formatFechaLarga(req.fecha_hora_propuesta)}</p>
                  <p className="text-sm text-indigo-600 font-medium mt-0.5">{formatHora(req.fecha_hora_propuesta)}</p>
                </div>
              )}
              {convenir && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
                  Este servicio requiere coordinar el horario. Usa la pestaña <strong>Coordinar</strong> para iniciar la conversación.
                </div>
              )}

              {/* Cliente */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Cliente</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {req.usuario.nombre} {req.usuario.apellido}
                </p>
                {req.usuario.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail className="w-3 h-3" />
                    {req.usuario.email}
                  </div>
                )}
                {req.usuario.telefono && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone className="w-3 h-3" />
                    {req.usuario.telefono}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Chat */
            <RequestChat
              solicitudId={req.id}
              autorId={negocioUserId}
              autorNombre={negocioNombre}
              autorTipo="negocio"
            />
          )}
        </div>

        {/* Acciones */}
        {req.estado === "PENDIENTE" && tab === "info" && (
          <div className="flex gap-2 px-5 py-4 border-t border-slate-100 flex-shrink-0">
            <button onClick={() => handle("cancel")} disabled={acting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
            <button onClick={() => handle("confirm")} disabled={acting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" /> Confirmar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function RequestsPage() {
  const { business, loading: bizLoading } = useMyBusiness();
  const { user } = useAuth();

  const [requests, setRequests] = useState<Solicitud[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [search,   setSearch]   = useState("");
  const [filtro,   setFiltro]   = useState<EstadoSolicitud | "TODAS">("TODAS");
  const [selected, setSelected] = useState<Solicitud | null>(null);

  useEffect(() => {
    if (bizLoading) return;
    if (!business) { setLoading(false); return; }
    Promise.all([
      requestsService.getByNegocio(business.id),
      servicesService.getByBusiness(business.id),
    ])
      .then(([reqs, svcs]) => { setRequests(reqs); setServices(svcs); })
      .catch(() => setError("No se pudieron cargar las solicitudes."))
      .finally(() => setLoading(false));
  }, [business, bizLoading]);

  const serviceFor = (id: string) => services.find((s) => s._id === id);

  const handleEstado = useCallback(async (id: number, estado: EstadoSolicitud) => {
    const updated = await requestsService.updateEstado(id, estado);
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, estado: updated.estado } : r));
    setSelected((prev) => prev?.id === id ? { ...prev, estado: updated.estado } : prev);
  }, []);

  const counts = requests.reduce(
    (acc, r) => { acc[r.estado]++; return acc; },
    { PENDIENTE: 0, CONFIRMADA: 0, CANCELADA: 0 } as Record<EstadoSolicitud, number>,
  );

  const filtered = requests.filter((r) => {
    const name = `${r.usuario.nombre} ${r.usuario.apellido}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchFiltro = filtro === "TODAS" || r.estado === filtro;
    return matchSearch && matchFiltro;
  });

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
      {/* Modal de detalle */}
      {selected && (
        <DetailModal
          req={selected}
          svc={serviceFor(selected.id_servicio_nosql)}
          negocioUserId={user?.id ?? 0}
          negocioNombre={business?.nombre ?? "Negocio"}
          onClose={() => setSelected(null)}
          onConfirm={(id) => handleEstado(id, "CONFIRMADA")}
          onCancel={(id)  => handleEstado(id, "CANCELADA")}
        />
      )}

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

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pendientes",  count: counts.PENDIENTE,  color: "border-amber-200 bg-amber-50",    text: "text-amber-700"   },
          { label: "Confirmadas", count: counts.CONFIRMADA, color: "border-emerald-200 bg-emerald-50", text: "text-emerald-700" },
          { label: "Canceladas",  count: counts.CANCELADA,  color: "border-rose-200 bg-rose-50",       text: "text-rose-700"   },
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="search"
              aria-label="Buscar solicitud por cliente"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>

          {/* Filtros de estado */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTROS.map((f) => (
              <button key={f.value} onClick={() => setFiltro(f.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  filtro === f.value
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
                {f.value !== "TODAS" && (
                  <span className="ml-1 opacity-70">({counts[f.value]})</span>
                )}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 flex items-center gap-1.5 flex-shrink-0">
            <ClipboardList className="w-4 h-4" />
            {filtered.length} solicitud{filtered.length !== 1 ? "es" : ""}
          </span>
        </div>

        {/* Filas */}
        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 py-16 text-sm">
            {requests.length === 0 ? "Aún no hay solicitudes para este negocio." : "Sin resultados."}
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((req) => {
              const s   = statusConfig[req.estado];
              const svc = serviceFor(req.id_servicio_nosql);
              const convenir = isAConvenir(svc);
              return (
                <div
                  key={req.id}
                  onClick={() => setSelected(req)}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {/* Info cliente */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {req.usuario.nombre} {req.usuario.apellido}
                      </p>
                      <span className="text-xs text-slate-400">#{req.id}</span>
                    </div>
                    <p className="text-xs text-slate-600">{svc?.nombre ?? req.id_servicio_nosql}</p>
                    {req.usuario.telefono && (
                      <p className="text-xs text-slate-400 mt-0.5">{req.usuario.telefono}</p>
                    )}
                  </div>

                  {/* Fecha y hora */}
                  <div className="hidden sm:block text-center min-w-[110px]">
                    {convenir ? (
                      <span className="text-xs text-amber-600 font-medium">A convenir</span>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-slate-700">{formatFecha(req.fecha_hora_propuesta)}</p>
                        <p className="text-xs text-slate-500">{formatHora(req.fecha_hora_propuesta)}</p>
                      </>
                    )}
                  </div>

                  {/* Estado */}
                  <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2.5 py-1 rounded-full flex-shrink-0 ${s.classes}`}>
                    {s.icon} {s.label}
                  </span>

                  {/* Indicador de chat para a_convenir */}
                  {convenir && req.estado !== "CANCELADA" && (
                    <MessageSquare className="w-4 h-4 text-indigo-400 flex-shrink-0" />
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
