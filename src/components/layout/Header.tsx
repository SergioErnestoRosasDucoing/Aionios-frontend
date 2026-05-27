"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMyBusiness } from "@/hooks/useMyBusiness";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { business } = useMyBusiness();

  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const initial     = user?.nombre?.charAt(0).toUpperCase() ?? "U";
  const displayName = business?.nombre ?? `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* Busqueda */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-72">
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar..."
          className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Notificaciones */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
          </button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
              </div>
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No tienes notificaciones nuevas</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200" />

        {/* Usuario con dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2.5 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors cursor-pointer">
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

          <div className="absolute right-0 top-12 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 hidden group-hover:block">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
