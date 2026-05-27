"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Scissors,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Star,
  HeadphonesIcon,
  LogOut,
} from "lucide-react";
import AioniosLogo from "@/components/ui/AioniosLogo";
import { useAuth } from "@/context/AuthContext";
import { useMyBusiness } from "@/hooks/useMyBusiness";

const navItems = [
  { label: "Panel principal",  href: "/dashboard",           icon: LayoutDashboard },
  { label: "Mi negocio",       href: "/dashboard/business",  icon: Building2       },
  { label: "Servicios",        href: "/dashboard/services",  icon: Scissors        },
  { label: "Agenda y horarios",href: "/dashboard/horarios",  icon: CalendarDays    },
  { label: "Solicitudes",      href: "/dashboard/requests",  icon: ClipboardList   },
  { label: "Pagos",            href: "/dashboard/payments",  icon: CreditCard      },
  { label: "Resenas",          href: "/dashboard/reviews",   icon: Star            },
  { label: "Soporte",          href: "/dashboard/support",   icon: HeadphonesIcon  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();
  const { business } = useMyBusiness();

  const initial      = user?.nombre?.charAt(0).toUpperCase() ?? "U";
  const displayName  = business?.nombre ?? `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim();
  const displayEmail = user?.email ?? "";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-60 bg-slate-900 flex flex-col flex-shrink-0">
      <div className="h-16 flex items-center px-5 border-b border-slate-800">
        <AioniosLogo size="sm" />
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3 mt-2">
          Menu principal
        </p>
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{displayName}</p>
            <p className="text-slate-500 text-xs truncate">{displayEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all w-full cursor-pointer"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
