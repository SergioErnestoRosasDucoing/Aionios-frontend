"use client";

import { useState, useEffect, type ReactNode } from "react";
import {
  Ticket, Search, Clock, CheckCircle,
  MessageSquare, ChevronRight, ChevronLeft,
  X, Send, Users, CircleDot,
} from "lucide-react";
import { ticketsService } from "@/services/tickets.service";
import { useAuth } from "@/context/AuthContext";
import type { TicketEstado, TicketPrioridad } from "@/types/ticket.types";

/* ── Re-use del mismo Ticket type ─────────────────────────── */
import type { Ticket as TicketType } from "@/types/ticket.types";

/* ── Configs visuales ─────────────────────────────────────── */
const STATUS_CONFIG: Record<TicketEstado, { label: string; classes: string; icon: ReactNode }> = {
  abierto:  { label: "Abierto",  classes: "bg-amber-50 text-amber-700 border-amber-200",       icon: <Clock className="w-3 h-3" /> },
  resuelto: { label: "Resuelto", classes: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle className="w-3 h-3" /> },
};

const PRIORITY_CONFIG: Record<TicketPrioridad, { label: string; dot: string }> = {
  baja:  { label: "Baja",  dot: "bg-slate-400"  },
  media: { label: "Media", dot: "bg-amber-400"   },
  alta:  { label: "Alta",  dot: "bg-rose-500"    },
};

const FILTROS: { label: string; value: TicketEstado | "todos" }[] = [
  { label: "Todos",     value: "todos"    },
  { label: "Abiertos",  value: "abierto"  },
  { label: "Resueltos", value: "resuelto" },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)  return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24)   return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} día${Math.floor(h / 24) > 1 ? "s" : ""}`;
}

/* ── Estadísticas rápidas ─────────────────────────────────── */
function StatsBar({ tickets }: { tickets: TicketType[] }) {
  const total    = tickets.length;
  const abiertos = tickets.filter((t) => t.estado === "abierto").length;
  const alta     = tickets.filter((t) => t.prioridad === "alta" && t.estado === "abierto").length;

  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: "Total de tickets", value: total,    color: "text-slate-900",   bg: "bg-white"       },
        { label: "Abiertos",         value: abiertos, color: "text-amber-700",   bg: "bg-amber-50"    },
        { label: "Alta prioridad",   value: alta,     color: "text-rose-700",    bg: "bg-rose-50"     },
      ].map((s) => (
        <div key={s.label} className={`${s.bg} rounded-2xl border border-slate-200 p-4`}>
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Vista detalle ────────────────────────────────────────── */
function TicketDetail({
  ticket,
  onBack,
  onUpdated,
}: {
  ticket: TicketType;
  onBack: () => void;
  onUpdated: (t: TicketType) => void;
}) {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState("");
  const [sending,   setSending]   = useState(false);
  const [acting,    setActing]    = useState(false);

  const s = STATUS_CONFIG[ticket.estado] ?? STATUS_CONFIG.abierto;
  const p = PRIORITY_CONFIG[ticket.prioridad ?? "media"];

  const handleReply = async () => {
    if (!replyText.trim() || !user) return;
    setSending(true);
    try {
      const updated = await ticketsService.addMensaje(
        ticket._id,
        replyText.trim(),
        user.id,
        `${user.nombre} ${user.apellido ?? ""}`.trim(),
      );
      onUpdated(updated);
      setReplyText("");
    } catch { /* silencioso */ }
    finally { setSending(false); }
  };

  const toggleEstado = async () => {
    setActing(true);
    try {
      const nuevoEstado: TicketEstado = ticket.estado === "abierto" ? "resuelto" : "abierto";
      const updated = await ticketsService.updateEstado(ticket._id, nuevoEstado);
      onUpdated(updated);
    } catch { /* silencioso */ }
    finally { setActing(false); }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" /> Volver a tickets
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {/* Cabecera */}
        <div className="flex items-start justify-between mb-5 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-400">#{ticket._id.slice(-6).toUpperCase()}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{ticket.categoria}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">Usuario #{ticket.usuario_id}</span>
            </div>
            <h2 className="text-base font-semibold text-slate-900">{ticket.asunto}</h2>
            <p className="text-xs text-slate-400 mt-1">{timeAgo(ticket.createdAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2.5 py-1 rounded-full ${s.classes}`}>
              {s.icon}{s.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <div className={`w-2 h-2 rounded-full ${p.dot}`} />{p.label}
            </span>
          </div>
        </div>

        {/* Mensajes */}
        <div className="space-y-3 max-h-96 overflow-y-auto mb-4 border-t border-slate-100 pt-4">
          {ticket.mensajes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Sin mensajes aún.</p>
          ) : (
            ticket.mensajes.map((m, i) => {
              const isAdmin = m.autor_id === user?.id;
              return (
                <div key={i} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] space-y-0.5 flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">
                        {m.autor_nombre ?? `Usuario #${m.autor_id}`}
                      </span>
                      <span className="text-[10px] text-slate-400">{timeAgo(m.fecha)}</span>
                    </div>
                    <div className={`px-3 py-2 rounded-2xl text-sm leading-snug ${
                      isAdmin
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    }`}>
                      {m.texto}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Responder */}
        <div className="flex gap-2 border-t border-slate-100 pt-4">
          <textarea
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
            placeholder="Responde al ticket... (Enter para enviar)"
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-400"
          />
          <button
            onClick={handleReply}
            disabled={sending || !replyText.trim()}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Cambiar estado */}
        <div className="flex justify-end mt-4">
          <button
            onClick={toggleEstado}
            disabled={acting}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
              ticket.estado === "abierto"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "border border-amber-300 text-amber-700 hover:bg-amber-50"
            }`}
          >
            {ticket.estado === "abierto" ? (
              <><CheckCircle className="w-4 h-4" /> Marcar como resuelto</>
            ) : (
              <><CircleDot className="w-4 h-4" /> Reabrir ticket</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Página principal ─────────────────────────────────────── */
export default function AdminTicketsPage() {
  const [tickets,  setTickets]  = useState<TicketType[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filtro,   setFiltro]   = useState<TicketEstado | "todos">("todos");
  const [selected, setSelected] = useState<TicketType | null>(null);

  useEffect(() => {
    ticketsService.getAll()
      .then(setTickets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdated = (updated: TicketType) => {
    setTickets((prev) => prev.map((t) => t._id === updated._id ? updated : t));
    setSelected(updated);
  };

  const filtered = tickets.filter((t) => {
    const matchSearch = !search || t.asunto.toLowerCase().includes(search.toLowerCase());
    const matchFiltro = filtro === "todos" || t.estado === filtro;
    return matchSearch && matchFiltro;
  });

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (selected) {
    return (
      <TicketDetail
        ticket={selected}
        onBack={() => setSelected(null)}
        onUpdated={handleUpdated}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Encabezado */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Ticket className="w-5 h-5 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-900">Gestión de tickets</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Revisa y responde los tickets de soporte de todos los negocios.
        </p>
      </div>

      {/* Stats */}
      <StatsBar tickets={tickets} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista */}
        <div className="lg:col-span-2 space-y-4">
          {/* Buscador */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar por asunto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            {FILTROS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltro(f.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  filtro === f.value
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f.label}
                {f.value !== "todos" && (
                  <span className="ml-1.5 opacity-70">
                    ({tickets.filter((t) => t.estado === f.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tickets */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Ticket className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">
                {tickets.length === 0 ? "No hay tickets registrados." : "Sin resultados para esta búsqueda."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((ticket) => {
                const s = STATUS_CONFIG[ticket.estado] ?? STATUS_CONFIG.abierto;
                const p = PRIORITY_CONFIG[ticket.prioridad ?? "media"];
                return (
                  <div
                    key={ticket._id}
                    onClick={() => setSelected(ticket)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-slate-400">#{ticket._id.slice(-6).toUpperCase()}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">{ticket.categoria}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <Users className="w-3 h-3" />
                            Usuario #{ticket.usuario_id}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 truncate">{ticket.asunto}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded-full ${s.classes}`}>
                          {s.icon}{s.label}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <div className={`w-2 h-2 rounded-full ${p.dot}`} />{p.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />{ticket.mensajes.length}
                        </span>
                        <span>{timeAgo(ticket.updatedAt ?? ticket.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel lateral de info */}
        <div className="space-y-4">
          <div className="bg-indigo-600 rounded-2xl p-5 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-semibold mb-1">Panel de administración</h3>
            <p className="text-indigo-200 text-xs leading-relaxed">
              Aquí puedes ver y gestionar todos los tickets de soporte. Responde, cierra o reabre tickets según sea necesario.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Por prioridad</h3>
            <div className="space-y-2">
              {(["alta", "media", "baja"] as TicketPrioridad[]).map((p) => {
                const cfg   = PRIORITY_CONFIG[p];
                const count = tickets.filter((t) => t.prioridad === p && t.estado === "abierto").length;
                return (
                  <div key={p} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className="text-xs text-slate-600">{cfg.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{count} abierto{count !== 1 ? "s" : ""}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Tiempos de respuesta</h3>
            <div className="space-y-2">
              {[
                { label: "Prioridad alta",  time: "< 2 horas",  dot: "bg-rose-500"  },
                { label: "Prioridad media", time: "< 8 horas",  dot: "bg-amber-400" },
                { label: "Prioridad baja",  time: "< 24 horas", dot: "bg-slate-400" },
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
