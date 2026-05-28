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
  ChevronLeft,
  ChevronRight,
  X,
  Ticket,
} from "lucide-react";
import AioniosLogo from "@/components/ui/AioniosLogo";
import { useAuth } from "@/context/AuthContext";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { ROLES } from "@/types/auth.types";

const businessNavItems = [
  { label: "Panel principal",   href: "/dashboard",          icon: LayoutDashboard },
  { label: "Mi negocio",        href: "/dashboard/business", icon: Building2       },
  { label: "Servicios",         href: "/dashboard/services", icon: Scissors        },
  { label: "Agenda y horarios", href: "/dashboard/horarios", icon: CalendarDays    },
  { label: "Solicitudes",       href: "/dashboard/requests", icon: ClipboardList   },
  { label: "Pagos",             href: "/dashboard/payments", icon: CreditCard      },
  { label: "Reseñas",           href: "/dashboard/reviews",  icon: Star            },
  { label: "Soporte",           href: "/dashboard/support",  icon: HeadphonesIcon  },
];

const adminNavItems = [
  { label: "Gestión de tickets", href: "/dashboard/admin/tickets", icon: Ticket },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();
  const { business } = useMyBusiness();

  const isSuperAdmin = user?.id_rol === ROLES.SUPERADMIN;
  const navItems     = isSuperAdmin ? adminNavItems : businessNavItems;

  const initial      = user?.nombre?.charAt(0).toUpperCase() ?? "U";
  const displayName  = isSuperAdmin
    ? `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim()
    : (business?.nombre ?? `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim());
  const displayEmail = user?.email ?? "";

  const handleLogout = () => { logout(); router.push("/business/login"); };

  const sidebarContent = (isMobile = false) => (
    <aside
      className={`bg-slate-900 flex flex-col flex-shrink-0 h-full transition-all duration-300 ${
        isMobile ? "w-64" : collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
        {(!collapsed || isMobile) && (
          <div className="overflow-hidden">
            <AioniosLogo size="sm" />
          </div>
        )}
        {isMobile ? (
          <button
            onClick={onMobileClose}
            className="ml-auto text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onToggle}
            className={`text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0 ${collapsed ? "mx-auto" : "ml-auto"}`}
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {(!collapsed || isMobile) && (
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3 mt-2">
            Menú principal
          </p>
        )}
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={isMobile ? onMobileClose : undefined}
              title={collapsed && !isMobile ? label : undefined}
              className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all ${
                collapsed && !isMobile ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"
              } ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
              {(!collapsed || isMobile) && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-slate-800 flex-shrink-0">
        {(!collapsed || isMobile) ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{displayName}</p>
              <p className="text-slate-500 text-xs truncate">
                {isSuperAdmin ? "Super administrador" : displayEmail}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed && !isMobile ? "Cerrar sesión" : undefined}
          className={`flex items-center gap-3 rounded-lg text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all w-full cursor-pointer ${
            collapsed && !isMobile ? "px-0 py-2 justify-center" : "px-3 py-2"
          }`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0">
        {sidebarContent(false)}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className="relative z-10 flex h-full">
            {sidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
