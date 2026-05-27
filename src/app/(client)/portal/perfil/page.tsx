import { User, Mail, Phone, MapPin, Bell, Shield, ChevronRight, Star, CalendarDays, LogOut } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Citas totales",   value: "5",   icon: CalendarDays },
  { label: "Resenas dadas",   value: "3",   icon: Star         },
  { label: "Negocios guardados", value: "7", icon: Shield      },
];

const menuSections = [
  {
    title: "Cuenta",
    items: [
      { icon: User,  label: "Datos personales",       sub: "Nombre, correo y telefono" },
      { icon: MapPin, label: "Mis direcciones",        sub: "Ubicaciones guardadas"     },
      { icon: Shield, label: "Seguridad y privacidad", sub: "Contrasena y sesiones"     },
    ],
  },
  {
    title: "Preferencias",
    items: [
      { icon: Bell, label: "Notificaciones",     sub: "Correo y push"              },
      { icon: Star, label: "Mis reseñas",        sub: "Ver y editar valoraciones"  },
    ],
  },
];

export default function PerfilPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Cabecera de perfil */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            C
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-slate-900">Carlos Usuario</p>
            <p className="text-sm text-slate-500">carlos@correo.com</p>
            <p className="text-xs text-slate-400 mt-0.5">Miembro desde mayo 2026</p>
          </div>
          <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
            Editar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon className="w-4 h-4 text-indigo-500" />
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </div>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Datos rapidos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 mb-1">Informacion de contacto</h2>
        {[
          { icon: Mail,  value: "carlos@correo.com"  },
          { icon: Phone, value: "+52 555 123 4567"   },
          { icon: MapPin, value: "Ciudad de Mexico"  },
        ].map(({ icon: Icon, value }) => (
          <div key={value} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-sm text-slate-700">{value}</span>
          </div>
        ))}
      </div>

      {/* Secciones del menu */}
      {menuSections.map((section) => (
        <div key={section.title} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 border-b border-slate-100">
            {section.title}
          </p>
          <div className="divide-y divide-slate-100">
            {section.items.map(({ icon: Icon, label, sub }) => (
              <button
                key={label}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{label}</p>
                  <p className="text-xs text-slate-400">{sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Cerrar sesion */}
      <Link
        href="/login"
        className="flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer w-full"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-semibold">Cerrar sesion</span>
      </Link>
    </div>
  );
}
