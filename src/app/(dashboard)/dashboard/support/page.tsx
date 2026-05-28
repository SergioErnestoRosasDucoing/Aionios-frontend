"use client";

import { useState, useEffect, type ReactNode } from "react";
import {
  HeadphonesIcon, Plus, Search, Clock, CheckCircle,
  MessageSquare, ChevronRight, X, Send, ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ticketsService } from "@/services/tickets.service";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/types/auth.types";
import type { Ticket, TicketEstado, TicketPrioridad, CreateTicketPayload } from "@/types/ticket.types";

const statusConfig: Record<TicketEstado, { label: string; classes: string; icon: ReactNode }> = {
  abierto:  { label: "Abierto",  classes: "bg-amber-50 text-amber-700 border-amber-200",       icon: <Clock className="w-3 h-3" /> },
  resuelto: { label: "Resuelto", classes: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle className="w-3 h-3" /> },
};

const priorityConfig: Record<TicketPrioridad, { label: string; dot: string }> = {
  baja:  { label: "Baja",  dot: "bg-slate-400" },
  media: { label: "Media", dot: "bg-amber-400" },
  alta:  { label: "Alta",  dot: "bg-rose-500"  },
};

const CATEGORIAS = ["Cuenta", "Pagos", "Servicios", "Notificaciones", "Funcionalidad", "General"];
const FILTROS: { label: string; value: TicketEstado | "todos" }[] = [
  { label: "Todos",     value: "todos"    },
  { label: "Abiertos",  value: "abierto"  },
  { label: "Resueltos", value: "resuelto" },
];


function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1)  return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24)   return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} día${Math.floor(h / 24) > 1 ? "s" : ""}`;
}

const EMPTY_FORM: CreateTicketPayload = {
  asunto: "", categoria: "General", prioridad: "media", mensaje_inicial: "",
};

export default function SupportPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Superadmin no usa esta página — tiene su propio panel
  useEffect(() => {
    if (user && user.id_rol === ROLES.SUPERADMIN) {
      router.replace("/dashboard/admin/tickets");
    }
  }, [user, router]);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState<TicketEstado | "todos">("todos");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateTicketPayload>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    ticketsService.getMine()
      .then(setTickets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter((t) => {
    const matchSearch = !search || t.asunto.toLowerCase().includes(search.toLowerCase());
    const matchFiltro = filtro === "todos" || t.estado === filtro;
    return matchSearch && matchFiltro;
  });

  const openCount    = tickets.filter((t) => t.estado !== "resuelto").length;
  const resolvedCount = tickets.filter((t) => t.estado === "resuelto").length;

  const handleCreate = async () => {
    if (!user) return;
    if (!form.asunto.trim() || !form.mensaje_inicial.trim()) {
      setCreateError("El asunto y el mensaje son obligatorios.");
      return;
    }
    setCreating(true); setCreateError(null);
    try {
      const t = await ticketsService.create({
        ...form,
        usuario_id: user.id,
        autor_nombre: `${user.nombre} ${user.apellido ?? ""}`.trim(),
      });
      setTickets((prev) => [t, ...prev]);
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch {
      setCreateError("No se pudo crear el ticket. Intenta de nuevo.");
    } finally {
      setCreating(false);
    }
  };

  const handleReply = async () => {
    if (!selected || !replyText.trim() || !user) return;
    setSending(true);
    try {
      const updated = await ticketsService.addMensaje(
        selected._id, replyText.trim(), user.id,
        `${user.nombre} ${user.apellido ?? ""}`.trim(),
      );
      setTickets((prev) => prev.map((t) => t._id === updated._id ? updated : t));
      setSelected(updated);
      setReplyText("");
    } catch {} finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-80 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  /* ── Vista detalle de ticket ───────────────────────────── */
  if (selected) {
    const s = statusConfig[selected.estado];
    const p = priorityConfig[selected.prioridad ?? "media"];
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <button onClick={() => setSelected(null)} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> Volver a tickets
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-400">{selected._id.slice(-6).toUpperCase()}</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">{selected.categoria}</span>
              </div>
              <h2 className="text-base font-semibold text-slate-900">{selected.asunto}</h2>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2.5 py-1 rounded-full ${s.classes}`}>
                {s.icon}{s.label}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <div className={`w-2 h-2 rounded-full ${p.dot}`} />{p.label}
              </span>
            </div>
          </div>

          {/* Mensajes */}
          <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
            {selected.mensajes.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Sin mensajes aún.</p>
            )}
            {selected.mensajes.map((m, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">{m.autor_nombre ?? `Usuario #${m.autor_id}`}</span>
                  <span className="text-[10px] text-slate-400">{timeAgo(m.fecha)}</span>
                </div>
                <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2">{m.texto}</p>
              </div>
            ))}
          </div>

          {/* Respuesta */}
          {selected.estado !== "resuelto" && (
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe un mensaje..."
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
          )}
        </div>
      </div>
    );
  }

  /* ── Lista de tickets ──────────────────────────────────── */
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Soporte técnico</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {openCount} ticket{openCount !== 1 ? "s" : ""} abierto{openCount !== 1 ? "s" : ""} · {resolvedCount} resuelto{resolvedCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nuevo ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar en tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>

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
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <HeadphonesIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">
                {tickets.length === 0 ? "No tienes tickets aún. ¡Crea uno si necesitas ayuda!" : "Sin resultados."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((ticket) => {
                const s = statusConfig[ticket.estado];
                const p = priorityConfig[ticket.prioridad ?? "media"];
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
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{ticket.asunto}</p>
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

        {/* Panel lateral */}
        <div className="space-y-4">
          <div className="bg-indigo-600 rounded-2xl p-5 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <HeadphonesIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-semibold mb-1">Soporte prioritario</h3>
            <p className="text-indigo-200 text-xs">
              Nuestro equipo está disponible de lunes a viernes de 9:00 a 18:00 hrs. Crea un ticket y te responderemos a la brevedad.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Tiempo de respuesta</h3>
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

      {/* Modal nuevo ticket */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Nuevo ticket de soporte</h2>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setCreateError(null); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{createError}</div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Asunto *</label>
                <input
                  value={form.asunto}
                  onChange={(e) => setForm((p) => ({ ...p, asunto: e.target.value }))}
                  placeholder="Describe brevemente el problema"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Categoría</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Prioridad</label>
                  <select
                    value={form.prioridad}
                    onChange={(e) => setForm((p) => ({ ...p, prioridad: e.target.value as TicketPrioridad }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Descripción *</label>
                <textarea
                  rows={3}
                  value={form.mensaje_inicial}
                  onChange={(e) => setForm((p) => ({ ...p, mensaje_inicial: e.target.value }))}
                  placeholder="Explica el problema con detalle..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setCreateError(null); }} className="flex-1 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {creating ? "Enviando..." : "Enviar ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
