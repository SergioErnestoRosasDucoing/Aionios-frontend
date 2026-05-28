"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bell, X, CalendarDays, CheckCircle, XCircle, ChevronRight,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { notificationsService } from "@/services/notifications.service";
import type { Notificacion, NotificacionTipo } from "@/types/notification.types";

/* ─── helpers ─────────────────────────────────────────────── */

const TIPO_META: Record<NotificacionTipo, { icon: React.ElementType; color: string; bg: string }> = {
  recordatorio_cita: { icon: CalendarDays, color: "text-indigo-600", bg: "bg-indigo-100" },
  pago_exitoso:      { icon: CheckCircle,  color: "text-emerald-600", bg: "bg-emerald-100" },
  cancelacion:       { icon: XCircle,      color: "text-rose-600",    bg: "bg-rose-100"    },
};

function formatFechaLarga(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    weekday: "long", day: "2-digit", month: "long",
    hour: "2-digit", minute: "2-digit",
  });
}
function formatFechaCorta(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

/* ─── tipos ───────────────────────────────────────────────── */

interface Props {
  usuarioId: number | undefined;
  /** href donde el usuario puede ver sus citas (distinto en cliente y negocio) */
  citasHref: string;
  citasLabel: string;
}

/* ─── modal detalle ───────────────────────────────────────── */

function DetailModal({
  notif,
  citasHref,
  citasLabel,
  onClose,
  onDelete,
}: {
  notif: Notificacion;
  citasHref: string;
  citasLabel: string;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const meta = TIPO_META[notif.tipo] ?? TIPO_META.recordatorio_cita;
  const Icon = meta.icon;

  // cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        {/* ícono tipo */}
        <div className={`w-12 h-12 rounded-2xl ${meta.bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${meta.color}`} />
        </div>

        {/* contenido */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">{notif.titulo}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{notif.mensaje}</p>
        </div>

        {/* fecha */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <CalendarDays className="w-3.5 h-3.5" />
          {formatFechaLarga(notif.createdAt)}
        </div>

        {/* acciones */}
        <div className="flex gap-2 pt-1">
          <Link
            href={citasHref}
            onClick={onClose}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors text-center"
          >
            {citasLabel}
          </Link>
          <button
            onClick={() => { onDelete(notif._id); onClose(); }}
            className="px-3 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-medium rounded-xl transition-colors cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── modal "ver todas" ───────────────────────────────────── */

function AllNotificationsModal({
  usuarioId,
  citasHref,
  citasLabel,
  onClose,
}: {
  usuarioId: number;
  citasHref: string;
  citasLabel: string;
  onClose: () => void;
}) {
  const [all, setAll]           = useState<Notificacion[]>([]);
  const [loadingAll, setLoading] = useState(true);
  const [active, setActive]     = useState<Notificacion | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    notificationsService
      .getByUser(usuarioId, 50)
      .then((data) => setAll(data.filter((n) => n.titulo !== "Actividad registrada")))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [usuarioId]);

  const handleDelete = useCallback(async (id: string) => {
    setAll((prev) => prev.filter((n) => n._id !== id));
    try { await notificationsService.remove(id); } catch { /* silencioso */ }
  }, []);

  const handleOpen = useCallback(async (n: Notificacion) => {
    setActive(n);
    if (!n.leido) {
      setAll((prev) => prev.map((x) => x._id === n._id ? { ...x, leido: true } : x));
      notificationsService.markRead(n._id).catch(() => {});
    }
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
          {/* header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Todas las notificaciones</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* lista */}
          <div className="overflow-y-auto flex-1">
            {loadingAll ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : all.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No tienes notificaciones</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {all.map((n) => {
                  const meta = TIPO_META[n.tipo] ?? TIPO_META.recordatorio_cita;
                  const Icon = meta.icon;
                  return (
                    <li
                      key={n._id}
                      className={`group flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !n.leido ? "bg-indigo-50/40" : ""
                      }`}
                      onClick={() => handleOpen(n)}
                    >
                      <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center`}>
                        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!n.leido && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                          <p className="text-sm font-semibold text-slate-800 truncate">{n.titulo}</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.mensaje}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{formatFechaCorta(n.createdAt)}</p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-200 cursor-pointer"
                          title="Eliminar"
                        >
                          <X className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* modal de detalle dentro del modal "ver todas" */}
      {active && (
        <DetailModal
          notif={active}
          citasHref={citasHref}
          citasLabel={citasLabel}
          onClose={() => setActive(null)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}

/* ─── componente principal ────────────────────────────────── */

export default function NotificationBell({ usuarioId, citasHref, citasLabel }: Props) {
  const { notifications, unread, remove, markRead } = useNotifications(usuarioId);

  const [showDropdown, setShowDropdown] = useState(false);
  const [activeNotif,  setActiveNotif]  = useState<Notificacion | null>(null);
  const [showAll,      setShowAll]      = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // cerrar dropdown al clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpenNotif = (n: Notificacion) => {
    setShowDropdown(false);
    if (!n.leido) markRead(n._id);
    setActiveNotif(n);
  };

  return (
    <>
      <div ref={dropRef} className="relative">
        {/* Botón campana */}
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
            {/* cabecera */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
              {unread > 0 && (
                <span className="text-xs text-indigo-600 font-medium">
                  {unread} nueva{unread !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* lista reciente */}
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No tienes notificaciones</p>
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.map((n) => {
                  const meta = TIPO_META[n.tipo] ?? TIPO_META.recordatorio_cita;
                  const Icon = meta.icon;
                  return (
                    <li
                      key={n._id}
                      className={`group flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !n.leido ? "bg-indigo-50/40" : ""
                      }`}
                      onClick={() => handleOpenNotif(n)}
                    >
                      <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center`}>
                        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {!n.leido && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                          <p className="text-sm font-medium text-slate-800 truncate">{n.titulo}</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.mensaje}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{formatFechaCorta(n.createdAt)}</p>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); remove(n._id); }}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-slate-200 cursor-pointer"
                        title="Eliminar"
                      >
                        <X className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* pie — ver todas */}
            <div className="px-4 py-2.5 border-t border-slate-100">
              <button
                onClick={() => { setShowDropdown(false); setShowAll(true); }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
              >
                Ver todas las notificaciones
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {activeNotif && (
        <DetailModal
          notif={activeNotif}
          citasHref={citasHref}
          citasLabel={citasLabel}
          onClose={() => setActiveNotif(null)}
          onDelete={(id) => { remove(id); setActiveNotif(null); }}
        />
      )}

      {/* Modal ver todas */}
      {showAll && usuarioId && (
        <AllNotificationsModal
          usuarioId={usuarioId}
          citasHref={citasHref}
          citasLabel={citasLabel}
          onClose={() => setShowAll(false)}
        />
      )}
    </>
  );
}
