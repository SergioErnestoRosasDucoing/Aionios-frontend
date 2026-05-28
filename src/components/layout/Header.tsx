"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Search, Menu, CalendarDays } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { requestsService } from "@/services/requests.service";
import type { Solicitud } from "@/types/request.types";

const SEEN_KEY = "aionios_seen_notif_ids";

function getSeenIds(): Set<number> {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]")); }
  catch { return new Set(); }
}
function markAllSeen(ids: number[]) {
  localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
}

interface HeaderProps { onMobileMenuOpen: () => void }

export default function Header({ onMobileMenuOpen }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { business } = useMyBusiness();

  const [showNotif,  setShowNotif]  = useState(false);
  const [showUser,   setShowUser]   = useState(false);
  const [pending,    setPending]    = useState<Solicitud[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef  = useRef<HTMLDivElement>(null);

  const initial     = user?.nombre?.charAt(0).toUpperCase() ?? "U";
  const displayName = business?.nombre ?? `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim();

  // Fetch pending requests
  useEffect(() => {
    if (!business) return;
    requestsService.getByNegocio(business.id)
      .then((reqs) => {
        const pendientes = reqs.filter((r) => r.estado === "PENDIENTE");
        setPending(pendientes);
        const seen = getSeenIds();
        setUnseenCount(pendientes.filter((r) => !seen.has(r.id)).length);
      })
      .catch(() => {});
  }, [business]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setShowUser(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenNotif = () => {
    setShowNotif((v) => !v);
    if (!showNotif && unseenCount > 0) {
      markAllSeen(pending.map((r) => r.id));
      setUnseenCount(0);
    }
  };

  const handleLogout = () => { logout(); router.push("/business/login"); };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — solo móvil */}
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
        >
          <Menu className="w-4 h-4 text-slate-600" />
        </button>

        {/* Búsqueda */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-44 sm:w-72">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notificaciones */}
        <div ref={notifRef} className="relative">
          <button
            onClick={handleOpenNotif}
            className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {unseenCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unseenCount > 9 ? "9+" : unseenCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
                {pending.length > 0 && (
                  <span className="text-xs text-indigo-600 font-medium">{pending.length} pendiente{pending.length !== 1 ? "s" : ""}</span>
                )}
              </div>

              {pending.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No tienes solicitudes pendientes</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {pending.map((req) => (
                    <Link
                      key={req.id}
                      href="/dashboard/requests"
                      onClick={() => setShowNotif(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CalendarDays className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {req.usuario.nombre} {req.usuario.apellido}
                        </p>
                        <p className="text-xs text-slate-500">Solicitud de cita pendiente</p>
                        <p className="text-xs text-indigo-600 mt-0.5">
                          {new Date(req.fecha_hora_propuesta).toLocaleDateString("es-MX", {
                            weekday: "short", day: "numeric", month: "short",
                          })}{" · "}
                          {new Date(req.fecha_hora_propuesta).toLocaleTimeString("es-MX", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="px-4 py-2.5 border-t border-slate-100">
                <Link
                  href="/dashboard/requests"
                  onClick={() => setShowNotif(false)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Ver todas las solicitudes →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200" />

        {/* Usuario con dropdown */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUser((v) => !v)}
            className="flex items-center gap-2.5 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-none truncate max-w-[120px]">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Administrador</p>
            </div>
          </button>

          {showUser && (
            <div className="absolute right-0 top-12 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
