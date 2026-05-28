"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu, Bell, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { useNotifications } from "@/hooks/useNotifications";

interface HeaderProps { onMobileMenuOpen: () => void }

export default function Header({ onMobileMenuOpen }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { business } = useMyBusiness();

  const [showUser,  setShowUser]  = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const userRef  = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { notifications, unread, remove } = useNotifications(user?.id);

  const initial     = user?.nombre?.charAt(0).toUpperCase() ?? "U";
  const displayName = business?.nombre ?? `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setShowUser(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      <div className="flex items-center gap-2">
        {/* Notificaciones */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
                {unread > 0 && (
                  <span className="text-xs text-indigo-600 font-medium">{unread} nueva{unread !== 1 ? "s" : ""}</span>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No tienes notificaciones</p>
                </div>
              ) : (
                <ul className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <li
                      key={n._id}
                      className={`group relative flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                        !n.leido ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      {/* Indicador no leído */}
                      {!n.leido && (
                        <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500" />
                      )}
                      {n.leido && <span className="mt-1.5 flex-shrink-0 w-2 h-2" />}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{n.titulo}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.mensaje}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleString("es-MX", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* Botón eliminar — visible al hover */}
                      <button
                        onClick={() => remove(n._id)}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-slate-200 cursor-pointer"
                        title="Eliminar notificación"
                      >
                        <X className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

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
