import Link from "next/link";
import { CalendarDays, Clock, MapPin, ChevronRight, CheckCircle, XCircle, RotateCcw, Plus } from "lucide-react";

type CitaStatus = "confirmed" | "pending" | "cancelled" | "completed";

interface Cita {
  id: string;
  business: string;
  category: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  city: string;
  status: CitaStatus;
  gradient: string;
}

const citas: Cita[] = [
  { id: "c1", business: "RehabPlus Fisioterapia", category: "Salud",    service: "Sesion de fisioterapia", date: "27 may 2026", time: "10:00", duration: "50 min", price: 450, city: "CDMX",        status: "confirmed",  gradient: "from-emerald-500 to-teal-600"   },
  { id: "c2", business: "TechFix Reparaciones",   category: "Tecnologia",service: "Reparacion de laptop",  date: "28 may 2026", time: "12:00", duration: "2 h",    price: 800, city: "Puebla",      status: "pending",    gradient: "from-violet-500 to-purple-600"  },
  { id: "c3", business: "Salon Bella Vista",       category: "Belleza",   service: "Tinte completo",        date: "15 may 2026", time: "11:00", duration: "2 h",    price: 850, city: "CDMX",        status: "completed",  gradient: "from-pink-500 to-rose-600"      },
  { id: "c4", business: "Torres Construccion",     category: "Construccion", service: "Visita de diagnostico", date: "10 may 2026", time: "09:00", duration: "1 h",price: 0,   city: "Monterrey",   status: "completed",  gradient: "from-orange-500 to-amber-600"   },
  { id: "c5", business: "CleanPro Tintoreria",     category: "Tintoreria",service: "Traje completo",        date: "5 may 2026",  time: "08:30", duration: "1 dia",  price: 280, city: "Guadalajara", status: "cancelled",  gradient: "from-cyan-500 to-blue-600"      },
];

const statusCfg: Record<CitaStatus, { label: string; badge: string; icon: React.ReactNode }> = {
  confirmed: { label: "Confirmada",  badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle className="w-3 h-3" /> },
  pending:   { label: "Pendiente",   badge: "bg-amber-50 text-amber-700 border-amber-200",       icon: <Clock className="w-3 h-3" />       },
  completed: { label: "Completada",  badge: "bg-indigo-50 text-indigo-700 border-indigo-200",    icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: "Cancelada",   badge: "bg-rose-50 text-rose-700 border-rose-200",          icon: <XCircle className="w-3 h-3" />     },
};

const upcoming  = citas.filter((c) => c.status === "confirmed" || c.status === "pending");
const past      = citas.filter((c) => c.status === "completed" || c.status === "cancelled");

export default function CitasPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis citas</h1>
          <p className="text-slate-500 text-sm mt-0.5">{upcoming.length} proximas · {past.length} anteriores</p>
        </div>
        <Link href="/portal/explorar" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Nueva cita
        </Link>
      </div>

      {/* Proximas */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Proximas</h2>
          <div className="space-y-3">
            {upcoming.map((c) => {
              const cfg = statusCfg[c.status];
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex">
                  <div className={`w-2 bg-gradient-to-b ${c.gradient} flex-shrink-0`} />
                  <div className="flex-1 p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>
                      {c.business.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900">{c.business}</p>
                      <p className="text-xs text-slate-500">{c.service}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{c.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.time} · {c.duration}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.city}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {cfg.icon}{cfg.label}
                      </span>
                      <p className="text-sm font-bold text-slate-900">{c.price === 0 ? "Gratis" : `$${c.price}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center pr-4">
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Historial */}
      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Historial</h2>
          <div className="space-y-3">
            {past.map((c) => {
              const cfg = statusCfg[c.status];
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex opacity-75 hover:opacity-100 transition-opacity">
                  <div className={`w-2 bg-gradient-to-b ${c.gradient} flex-shrink-0`} />
                  <div className="flex-1 p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white text-lg font-bold flex-shrink-0 grayscale`}>
                      {c.business.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700">{c.business}</p>
                      <p className="text-xs text-slate-500">{c.service}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{c.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.time}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {cfg.icon}{cfg.label}
                      </span>
                      {c.status === "completed" && (
                        <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 cursor-pointer">
                          <RotateCcw className="w-3 h-3" /> Repetir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {citas.length === 0 && (
        <div className="text-center py-20">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Aun no tienes citas</p>
          <Link href="/portal/explorar" className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
            Explorar negocios
          </Link>
        </div>
      )}
    </div>
  );
}
