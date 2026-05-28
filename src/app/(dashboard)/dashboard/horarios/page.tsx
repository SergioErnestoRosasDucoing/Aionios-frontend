"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock, X,
  CheckCircle, XCircle, Mail, Phone, MessageSquare, User,
} from "lucide-react";
import { requestsService } from "@/services/requests.service";
import { horariosService } from "@/services/horarios.service";
import { servicesService } from "@/services/services.service";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { useAuth } from "@/context/AuthContext";
import RequestChat from "@/components/ui/RequestChat";
import type { Solicitud } from "@/types/request.types";
import type { Service } from "@/types/service.types";

const HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const HOUR_START = 9;
const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const COLORS = [
  "bg-indigo-100 border-indigo-300 text-indigo-800",
  "bg-violet-100 border-violet-300 text-violet-800",
  "bg-emerald-100 border-emerald-300 text-emerald-800",
  "bg-amber-100 border-amber-300 text-amber-800",
  "bg-rose-100 border-rose-300 text-rose-800",
  "bg-cyan-100 border-cyan-300 text-cyan-800",
];

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}
function formatFechaLarga(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function getWeekStart(offset = 0): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = (day === 0 ? -6 : 1 - day) + offset * 7;
  const start = new Date(today);
  start.setDate(today.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}
function addDays(date: Date, n: number): Date {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
}
function formatDateLabel(d: Date) {
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}
function hourIndex(iso: string): number {
  return new Date(iso).getHours() - HOUR_START;
}
function dayIndex(iso: string, weekStart: Date): number {
  const d = new Date(iso); d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - weekStart.getTime()) / 86400000);
}
function isAConvenir(svc: Service | undefined): boolean {
  return svc?.unidadDuracion === "a_convenir";
}

/* ─── Modal de detalle de cita ──────────────────────────── */
function AppointmentModal({
  req,
  svc,
  onClose,
  onConfirm,
  onCancel,
  negocioUserId,
  negocioNombre,
}: {
  req: Solicitud;
  svc: Service | undefined;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
  onCancel:  (id: number) => Promise<void>;
  negocioUserId: number;
  negocioNombre: string;
}) {
  const [activeTab, setActiveTab] = useState<"info" | "chat">("info");
  const [acting, setActing] = useState(false);
  const convenir = isAConvenir(svc);

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
              req.estado === "CONFIRMADA"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : req.estado === "CANCELADA"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {req.estado === "CONFIRMADA" ? <CheckCircle className="w-3 h-3" /> : req.estado === "CANCELADA" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {req.estado === "CONFIRMADA" ? "Confirmada" : req.estado === "CANCELADA" ? "Cancelada" : "Pendiente"}
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Tabs — solo si es a_convenir */}
        {convenir && (
          <div className="flex border-b border-slate-100 flex-shrink-0">
            {(["info", "chat"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === t ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "chat" && <MessageSquare className="w-3.5 h-3.5" />}
                {t === "info" ? "Detalles" : "Coordinar"}
              </button>
            ))}
          </div>
        )}

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "info" ? (
            <>
              {/* Servicio */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                <p className="text-xs font-medium text-slate-500">Servicio</p>
                <p className="text-sm font-semibold text-slate-900">{svc?.nombre ?? "Servicio"}</p>
                {svc && (
                  <p className="text-xs text-slate-500">
                    {svc.precio === 0 ? "Gratis" : `$${svc.precio.toLocaleString()}`}
                    {" · "}
                    {svc.unidadDuracion === "a_convenir"
                      ? "Duración a convenir"
                      : `${svc.duracion ?? ""} ${svc.unidadDuracion}`}
                  </p>
                )}
              </div>

              {/* Fecha */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Fecha propuesta</p>
                  <p className="text-sm font-semibold text-slate-900">{formatFechaLarga(req.fecha_hora_propuesta)}</p>
                  {!convenir && (
                    <p className="text-xs text-slate-500 mt-0.5">{formatHora(req.fecha_hora_propuesta)}</p>
                  )}
                  {convenir && (
                    <p className="text-xs text-amber-600 font-medium mt-0.5">⏳ Horario a coordinar</p>
                  )}
                </div>
              </div>

              {/* Cliente */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <p className="text-xs font-medium text-slate-500 mb-2">Datos del cliente</p>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  {req.usuario.nombre} {req.usuario.apellido}
                </div>
                {req.usuario.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    {req.usuario.email}
                  </div>
                )}
                {req.usuario.telefono && (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    {req.usuario.telefono}
                  </div>
                )}
              </div>

              {/* Aviso a_convenir */}
              {convenir && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
                  Este servicio requiere coordinar el horario con el cliente. Usa la pestaña <strong>Coordinar</strong> para iniciar la conversación.
                </div>
              )}
            </>
          ) : (
            /* Tab chat */
            <RequestChat
              solicitudId={req.id}
              autorId={negocioUserId}
              autorNombre={negocioNombre}
              autorTipo="negocio"
            />
          )}
        </div>

        {/* Acciones */}
        {req.estado !== "CANCELADA" && activeTab === "info" && (
          <div className="flex gap-2 px-5 py-4 border-t border-slate-100 flex-shrink-0">
            {req.estado === "PENDIENTE" && (
              <button
                onClick={() => handle("confirm")}
                disabled={acting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmar
              </button>
            )}
            <button
              onClick={() => handle("cancel")}
              disabled={acting}
              className="flex-1 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              Cancelar cita
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────── */
export default function HorariosPage() {
  const { business, loading: bizLoading } = useMyBusiness();
  const { user } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  const [requests,   setRequests]   = useState<Solicitud[]>([]);
  const [services,   setServices]   = useState<Service[]>([]);
  const [blocks,     setBlocks]     = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [activeReq,  setActiveReq]  = useState<Solicitud | null>(null);

  const [blockForm,    setBlockForm]    = useState({ fecha: "", hora_inicio: "09:00", hora_fin: "10:00", motivo: "" });
  const [blocking,     setBlocking]     = useState(false);
  const [blockError,   setBlockError]   = useState<string | null>(null);
  const [blockSuccess, setBlockSuccess] = useState(false);

  const todayStr    = new Date().toISOString().split("T")[0];
  const nowTimeStr  = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
  const isBlockDateToday = blockForm.fecha === todayStr;

  const weekStart = getWeekStart(weekOffset);
  const weekEnd   = addDays(weekStart, 6);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (bizLoading) return;
    if (!business) { setLoading(false); return; }
    Promise.all([
      requestsService.getByNegocio(business.id),
      servicesService.getByBusiness(business.id),
      horariosService.getByNegocio(business.id),
    ])
      .then(([reqs, svcs, horario]) => {
        setRequests(reqs);
        setServices(svcs);
        setBlocks(horario?.excepciones_y_festivos ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [business, bizLoading]);

  const serviceFor = (mongoId: string) => services.find((s) => s._id === mongoId);

  // Citas activas de la semana — excluir canceladas y a_convenir (no tienen hora en la cuadrícula)
  const weekRequests = requests.filter((r) => {
    if (r.estado === "CANCELADA") return false;
    const svc = serviceFor(r.id_servicio_nosql);
    if (isAConvenir(svc)) return false;
    const di = dayIndex(r.fecha_hora_propuesta, weekStart);
    return di >= 0 && di <= 6;
  });

  // Citas a_convenir activas (sin hora fija)
  const convenirRequests = requests.filter((r) => {
    if (r.estado === "CANCELADA") return false;
    const svc = serviceFor(r.id_servicio_nosql);
    return isAConvenir(svc);
  });

  const weekBlocks = blocks.filter((b) => {
    if (!b.fecha) return false;
    const bDate = new Date(b.fecha); bDate.setHours(0, 0, 0, 0);
    return bDate >= weekStart && bDate <= weekEnd;
  });

  const handleConfirm = async (id: number) => {
    const updated = await requestsService.updateEstado(id, "CONFIRMADA");
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, estado: updated.estado } : r));
  };
  const handleCancel = async (id: number) => {
    const updated = await requestsService.updateEstado(id, "CANCELADA");
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, estado: updated.estado } : r));
  };

  const handleAddBlock = async () => {
    if (!business) return;
    if (!blockForm.fecha || !blockForm.hora_inicio || !blockForm.hora_fin) { setBlockError("Completa fecha y horario."); return; }
    if (blockForm.fecha < todayStr) { setBlockError("No puedes bloquear una fecha que ya pasó."); return; }
    if (blockForm.fecha === todayStr && blockForm.hora_inicio <= nowTimeStr) { setBlockError("La hora de inicio debe ser posterior a la hora actual."); return; }
    if (blockForm.hora_inicio >= blockForm.hora_fin) { setBlockError("La hora de inicio debe ser anterior a la de fin."); return; }
    setBlocking(true); setBlockError(null);
    try {
      const updated = await horariosService.addBloqueo(business.id, blockForm);
      setBlocks(updated.excepciones_y_festivos ?? []);
      setBlockSuccess(true);
      setBlockForm({ fecha: "", hora_inicio: "09:00", hora_fin: "10:00", motivo: "" });
      setTimeout(() => setBlockSuccess(false), 3000);
    } catch { setBlockError("No se pudo bloquear el horario. Intenta de nuevo."); }
    finally { setBlocking(false); }
  };

  const handleRemoveBlock = async (index: number) => {
    if (!business) return;
    try {
      await horariosService.removeBloqueo(business.id, index);
      setBlocks((prev) => prev.filter((_, i) => i !== index));
    } catch {}
  };

  const upcoming = [...requests]
    .filter((r) => r.estado !== "CANCELADA" && new Date(r.fecha_hora_propuesta) >= new Date())
    .sort((a, b) => new Date(a.fecha_hora_propuesta).getTime() - new Date(b.fecha_hora_propuesta).getTime())
    .slice(0, 5);

  if (bizLoading || loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 w-56 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 h-96 bg-slate-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-48 bg-slate-100 rounded-2xl" />
            <div className="h-56 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda y horarios</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {formatDateLabel(weekStart)} — {formatDateLabel(weekEnd)}
          </p>
        </div>
      </div>

      {!business && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
          No tienes un negocio registrado. Crea uno desde <strong>Mi negocio</strong>.
        </div>
      )}

      {/* Citas a convenir */}
      {convenirRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-amber-800">
              Citas pendientes de coordinar ({convenirRequests.length})
            </h2>
          </div>
          <div className="space-y-2">
            {convenirRequests.map((r) => {
              const svc = serviceFor(r.id_servicio_nosql);
              return (
                <div
                  key={r.id}
                  onClick={() => setActiveReq(r)}
                  className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-200 cursor-pointer hover:shadow-sm transition-shadow"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {r.usuario.nombre} {r.usuario.apellido}
                    </p>
                    <p className="text-xs text-slate-500">{svc?.nombre ?? "Servicio"} · {formatFechaLarga(r.fecha_hora_propuesta)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      r.estado === "CONFIRMADA" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {r.estado === "CONFIRMADA" ? "Confirmada" : "Pendiente"}
                    </span>
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendario semanal */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">
                {weekStart.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
              </h2>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setWeekOffset((o) => o - 1)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setWeekOffset(0)} className="px-3 h-8 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 cursor-pointer">
                Hoy
              </button>
              <button onClick={() => setWeekOffset((o) => o + 1)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-8 border-b border-slate-100">
                <div className="p-3" />
                {weekDates.map((date, i) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <div key={i} className="p-3 text-center border-l border-slate-100">
                      <p className="text-xs font-medium text-slate-500">{DAY_LABELS[i]}</p>
                      <p className={`text-sm font-bold mt-0.5 w-7 h-7 rounded-full flex items-center justify-center mx-auto ${isToday ? "bg-indigo-600 text-white" : "text-slate-900"}`}>
                        {date.getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {HOURS.map((hour, hIdx) => (
                <div key={hour} className="grid grid-cols-8 border-b border-slate-50 min-h-[52px]">
                  <div className="px-3 py-2 text-xs text-slate-400 text-right font-medium pt-1.5 border-r border-slate-100">
                    {hour}
                  </div>
                  {weekDates.map((_, dIdx) => {
                    const req = weekRequests.find(
                      (r) => dayIndex(r.fecha_hora_propuesta, weekStart) === dIdx && hourIndex(r.fecha_hora_propuesta) === hIdx,
                    );
                    const block = weekBlocks.find((b) => {
                      const bDate = new Date(b.fecha); bDate.setHours(0, 0, 0, 0);
                      const bDayIdx = Math.round((bDate.getTime() - weekStart.getTime()) / 86400000);
                      const startH = parseInt(b.hora_inicio?.split(":")[0] ?? "0");
                      const endH   = parseInt(b.hora_fin?.split(":")[0] ?? "0");
                      return bDayIdx === dIdx && (HOUR_START + hIdx) >= startH && (HOUR_START + hIdx) < endH;
                    });

                    return (
                      <div key={dIdx} className="border-l border-slate-50 relative p-1">
                        {block && (
                          <div className="rounded-lg bg-slate-100 border border-slate-300 text-xs p-1.5 h-full min-h-[44px]">
                            <p className="font-semibold text-slate-500 truncate">Bloqueado</p>
                            {block.motivo && <p className="text-slate-400 truncate">{block.motivo}</p>}
                          </div>
                        )}
                        {req && !block && (
                          <div
                            onClick={() => setActiveReq(req)}
                            className={`rounded-lg border text-xs p-1.5 cursor-pointer hover:opacity-80 hover:shadow-sm transition-all ${COLORS[req.id % COLORS.length]}`}
                          >
                            <p className="font-semibold truncate">{req.usuario.nombre} {req.usuario.apellido}</p>
                            <p className="opacity-70 truncate">{serviceFor(req.id_servicio_nosql)?.nombre ?? "Servicio"}</p>
                            <p className="opacity-50 text-[10px] mt-0.5">{req.estado === "PENDIENTE" ? "⏳" : "✓"}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Próximas citas</h2>
            {upcoming.length === 0 ? (
              <p className="text-xs text-slate-400">No hay citas próximas.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((req) => {
                  const svc = serviceFor(req.id_servicio_nosql);
                  return (
                    <div
                      key={req.id}
                      onClick={() => setActiveReq(req)}
                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="text-center min-w-[46px]">
                        {isAConvenir(svc) ? (
                          <p className="text-xs font-bold text-amber-600">A conv.</p>
                        ) : (
                          <p className="text-xs font-bold text-indigo-600">{formatHora(req.fecha_hora_propuesta)}</p>
                        )}
                        <p className="text-[10px] text-slate-400">
                          {new Date(req.fecha_hora_propuesta).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {req.usuario.nombre} {req.usuario.apellido}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{svc?.nombre ?? "Servicio"}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className={`text-xs font-medium ${req.estado === "PENDIENTE" ? "text-amber-600" : "text-emerald-600"}`}>
                            {req.estado === "PENDIENTE" ? "Por confirmar" : "Confirmada"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bloqueo de horas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Bloquear horario</h2>
            <p className="text-xs text-slate-500 mb-4">Marca periodos en los que no estarás disponible.</p>

            {blockError && <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 mb-3">{blockError}</div>}
            {blockSuccess && <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-700 mb-3">Horario bloqueado correctamente.</div>}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Fecha</label>
                <input type="date" value={blockForm.fecha} min={todayStr}
                  onChange={(e) => setBlockForm((p) => ({ ...p, fecha: e.target.value, hora_inicio: "09:00", hora_fin: "10:00" }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Desde</label>
                  <input type="time" value={blockForm.hora_inicio} min={isBlockDateToday ? nowTimeStr : undefined}
                    onChange={(e) => setBlockForm((p) => ({ ...p, hora_inicio: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Hasta</label>
                  <input type="time" value={blockForm.hora_fin}
                    onChange={(e) => setBlockForm((p) => ({ ...p, hora_fin: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Motivo (opcional)</label>
                <input type="text" value={blockForm.motivo}
                  onChange={(e) => setBlockForm((p) => ({ ...p, motivo: e.target.value }))}
                  placeholder="Ej. Reunión de equipo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <button onClick={handleAddBlock} disabled={blocking || !business}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed">
                {blocking ? "Bloqueando..." : "Bloquear horario"}
              </button>
            </div>

            {blocks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <p className="text-xs font-medium text-slate-600 mb-2">Bloques activos</p>
                {blocks.map((b, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{b.fecha}</p>
                      <p className="text-[10px] text-slate-500">{b.hora_inicio} – {b.hora_fin}{b.motivo ? ` · ${b.motivo}` : ""}</p>
                    </div>
                    <button onClick={() => handleRemoveBlock(i)} className="text-slate-400 hover:text-rose-500 cursor-pointer p-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal detalle de cita */}
      {activeReq && (
        <AppointmentModal
          req={activeReq}
          svc={serviceFor(activeReq.id_servicio_nosql)}
          onClose={() => setActiveReq(null)}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          negocioUserId={user?.id ?? 0}
          negocioNombre={business?.nombre ?? "Negocio"}
        />
      )}
    </div>
  );
}
