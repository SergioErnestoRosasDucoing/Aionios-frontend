"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, CalendarDays, User, Home, Compass } from "lucide-react";
import AioniosLogo from "@/components/ui/AioniosLogo";

const navLinks = [
  { href: "/portal",        label: "Inicio",   icon: Home    },
  { href: "/portal/explorar", label: "Explorar", icon: Compass },
  { href: "/portal/citas",  label: "Mis citas", icon: CalendarDays },
  { href: "/portal/perfil", label: "Perfil",    icon: User    },
];

export default function ClientNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/portal">
          <AioniosLogo size="sm" textColor="text-slate-900" />
        </Link>

        {/* Barra de búsqueda central */}
        <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Busca un negocio o servicio..."
            className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>

        {/* Links de navegación + acciones */}
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
          <button className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer ml-1">
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
          </button>

          {/* Avatar */}
          <Link href="/portal/perfil" className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold ml-1 cursor-pointer">
            C
          </Link>
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
