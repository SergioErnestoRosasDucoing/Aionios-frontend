"use client";

import { useState, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { requestsService } from "@/services/requests.service";
import { horariosService } from "@/services/horarios.service";
import { servicesService } from "@/services/services.service";
import { useMyBusiness } from "@/hooks/useMyBusiness";
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
  const d = new Date(iso);
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
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
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDateLabel(d: Date) {
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

function hourIndex(iso: string): number {
  return new Date(iso).getHours() - HOUR_START;
}

function dayIndex(iso: string, weekStart: Date): number {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - weekStart.getTime()) / 86400000);
}

export default function HorariosPage() {
  const { business, loading: bizLoading } = useMyBusiness();
  const [weekOffset, setWeekOffset] = useState(0);
  const [requests, setRequests] = useState<Solicitud[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Block form
  const [blockForm, setBlockForm] = useState({ fecha: "", hora_inicio: "09:00", hora_fin: "10:00", motivo: "" });
  const [blocking, setBlocking] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [blockSuccess, setBlockSuccess] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const nowTimeStr = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
  const isBlockDateToday = blockForm.fecha === todayStr;

  const weekStart = getWeekStart(weekOffset);
  const weekEnd = addDays(weekStart, 6);
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

  const serviceNameFor = (mongoId: string) =>
    services.find((s) => s._id === mongoId)?.nombre ?? "Servicio";

  // Only show confirmed + pending solicitudes in the calendar
  const weekRequests = requests.filter((r) => {
    if (r.estado === "CANCELADA") return false;
    const di = dayIndex(r.fecha_hora_propuesta, weekStart);
    return di >= 0 && di <= 6;
  });

  // Blocks for this week
  const weekBlocks = blocks.filter((b) => {
    if (!b.fecha) return false;
    const bDate = new Date(b.fecha);
    bDate.setHours(0, 0, 0, 0);
    return bDate >= weekStart && bDate <= weekEnd;
  });

  const handleAddBlock = async () => {
    if (!business) return;
    if (!blockForm.fecha || !blockForm.hora_inicio || !blockForm.hora_fin) {
      setBlockError("Completa fecha y horario.");
      return;
    }
    if (blockForm.fecha < todayStr) {
      setBlockError("No puedes bloquear una fecha que ya pasó.");
      return;
    }
    if (blockForm.fecha === todayStr && blockForm.hora_inicio <= nowTimeStr) {
      setBlockError("La hora de inicio debe ser posterior a la hora actual.");
      return;
    }
    if (blockForm.hora_inicio >= blockForm.hora_fin) {
      setBlockError("La hora de inicio debe ser anterior a la de fin.");
      return;
    }
    setBlocking(true);
    setBlockError(null);
    try {
      const updated = await horariosService.addBloqueo(business.id, blockForm);
      setBlocks(updated.excepciones_y_festivos ?? []);
      setBlockSuccess(true);
      setBlockForm({ fecha: "", hora_inicio: "09:00", hora_fin: "10:00", motivo: "" });
      setTimeout(() => setBlockSuccess(false), 3000);
    } catch {
      setBlockError("No se pudo bloquear el horario. Intenta de nuevo.");
    } finally {
      setBlocking(false);
    }
  };

  const handleRemoveBlock = async (index: number) => {
    if (!business) return;
    try {
      await horariosService.removeBloqueo(business.id, index);
      setBlocks((prev) => prev.filter((_, i) => i !== index));
    } catch {}
  };

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

  // Upcoming confirmed/pending citas (next 5)
  const upcoming = [...requests]
    .filter((r) => r.estado !== "CANCELADA" && new Date(r.fecha_hora_propuesta) >= new Date())
    .sort((a, b) => new Date(a.fecha_hora_propuesta).getTime() - new Date(b.fecha_hora_propuesta).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendario semanal */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Navegacion */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">
                {weekStart.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
              </h2>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setWeekOffset((o) => o - 1)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                className="px-3 h-8 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 cursor-pointer"
              >
                Hoy
              </button>
              <button
                onClick={() => setWeekOffset((o) => o + 1)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Header dias */}
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

              {/* Filas de horas */}
              {HOURS.map((hour, hIdx) => (
                <div key={hour} className="grid grid-cols-8 border-b border-slate-50 min-h-[52px]">
                  <div className="px-3 py-2 text-xs text-slate-400 text-right font-medium pt-1.5 border-r border-slate-100">
                    {hour}
                  </div>
                  {weekDates.map((_, dIdx) => {
                    const req = weekRequests.find(
                      (r) => dayIndex(r.fecha_hora_propuesta, weekStart) === dIdx && hourIndex(r.fecha_hora_propuesta) === hIdx
                    );
                    const block = weekBlocks.find((b) => {
                      const bDate = new Date(b.fecha);
                      bDate.setHours(0, 0, 0, 0);
                      const bDayIdx = Math.round((bDate.getTime() - weekStart.getTime()) / 86400000);
                      const startH = parseInt(b.hora_inicio?.split(":")[0] ?? "0");
                      const endH = parseInt(b.hora_fin?.split(":")[0] ?? "0");
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
                          <div className={`rounded-lg border text-xs p-1.5 cursor-pointer hover:opacity-80 transition-opacity ${COLORS[req.id % COLORS.length]}`}>
                            <p className="font-semibold truncate">{req.usuario.nombre} {req.usuario.apellido}</p>
                            <p className="opacity-70 truncate">{serviceNameFor(req.id_servicio_nosql)}</p>
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
          {/* Proximas citas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Próximas citas</h2>
            {upcoming.length === 0 ? (
              <p className="text-xs text-slate-400">No hay citas próximas.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((req) => (
                  <div key={req.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="text-center min-w-[46px]">
                      <p className="text-xs font-bold text-indigo-600">{formatHora(req.fecha_hora_propuesta)}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(req.fecha_hora_propuesta).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {req.usuario.nombre} {req.usuario.apellido}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{serviceNameFor(req.id_servicio_nosql)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className={`text-xs font-medium ${req.estado === "PENDIENTE" ? "text-amber-600" : "text-emerald-600"}`}>
                          {req.estado === "PENDIENTE" ? "Por confirmar" : "Confirmada"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bloqueo de horas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Bloquear horario</h2>
            <p className="text-xs text-slate-500 mb-4">Marca periodos en los que no estarás disponible.</p>

            {blockError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 mb-3">{blockError}</div>
            )}
            {blockSuccess && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-700 mb-3">
                Horario bloqueado correctamente.
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Fecha</label>
                <input
                  type="date"
                  value={blockForm.fecha}
                  min={todayStr}
                  onChange={(e) => setBlockForm((p) => ({ ...p, fecha: e.target.value, hora_inicio: "09:00", hora_fin: "10:00" }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Desde</label>
                  <input
                    type="time"
                    value={blockForm.hora_inicio}
                    min={isBlockDateToday ? nowTimeStr : undefined}
                    onChange={(e) => setBlockForm((p) => ({ ...p, hora_inicio: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Hasta</label>
                  <input
                    type="time"
                    value={blockForm.hora_fin}
                    onChange={(e) => setBlockForm((p) => ({ ...p, hora_fin: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Motivo (opcional)</label>
                <input
                  type="text"
                  value={blockForm.motivo}
                  onChange={(e) => setBlockForm((p) => ({ ...p, motivo: e.target.value }))}
                  placeholder="Ej. Reunión de equipo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={handleAddBlock}
                disabled={blocking || !business}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {blocking ? "Bloqueando..." : "Bloquear horario"}
              </button>
            </div>

            {/* Bloques activos */}
            {blocks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <p className="text-xs font-medium text-slate-600 mb-2">Bloques activos</p>
                {blocks.map((b, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{b.fecha}</p>
                      <p className="text-[10px] text-slate-500">{b.hora_inicio} – {b.hora_fin}{b.motivo ? ` · ${b.motivo}` : ""}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveBlock(i)}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
