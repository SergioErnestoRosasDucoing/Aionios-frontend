"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, CalendarDays, User, Home, Compass } from "lucide-react";
import AioniosLogo from "@/components/ui/AioniosLogo";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/ui/NotificationBell";

const navLinks = [
  { href: "/portal",          label: "Inicio",    icon: Home        },
  { href: "/portal/explorar", label: "Explorar",  icon: Compass     },
  { href: "/portal/citas",    label: "Mis citas", icon: CalendarDays },
  { href: "/portal/perfil",   label: "Perfil",    icon: User        },
];

export default function ClientNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();

  const [showUser, setShowUser] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  const initial = user?.nombre?.charAt(0).toUpperCase() ?? "U";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/portal">
          <AioniosLogo size="sm" textColor="text-slate-900" />
        </Link>

        {/* Búsqueda */}
        <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Busca un negocio o servicio..."
            className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>

        {/* Nav links + acciones */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/portal" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}

          {/* Notificaciones */}
          <div className="ml-1">
            <NotificationBell
              usuarioId={user?.id}
              citasHref="/portal/citas"
              citasLabel="Ver mis citas"
            />
          </div>

          {/* Avatar con dropdown */}
          <div ref={userRef} className="relative ml-1">
            <button
              onClick={() => setShowUser((v) => !v)}
              className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer"
            >
              {initial}
            </button>
            {showUser && (
              <div className="absolute right-0 top-11 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                <Link
                  href="/portal/perfil"
                  onClick={() => setShowUser(false)}
                  className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Mi perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 cursor-pointer"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Nav mobile inferior */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-40">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/portal" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                active ? "text-indigo-600" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-indigo-600" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
