import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, Phone, Clock, ChevronLeft, CheckCircle } from "lucide-react";
import { getBusinessById } from "@/lib/mock-businesses";

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const biz = getBusinessById(id);
  if (!biz) notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link href="/portal/explorar" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Volver a explorar
      </Link>

      {/* Banner del negocio */}
      <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${biz.gradient} h-40 md:h-52 flex items-end p-6`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex items-end gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl font-bold text-slate-700 flex-shrink-0">
            {biz.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{biz.name}</h1>
            <p className="text-white/80 text-sm">{biz.category} · {biz.city}</p>
          </div>
        </div>
        {biz.openNow
          ? <span className="absolute top-4 right-4 text-xs font-semibold bg-emerald-500 text-white px-3 py-1 rounded-full">Abierto ahora</span>
          : <span className="absolute top-4 right-4 text-xs font-semibold bg-slate-700/70 text-white px-3 py-1 rounded-full">Cerrado</span>
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda — info + servicios */}
        <div className="lg:col-span-2 space-y-5">
          {/* Info general */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Sobre el negocio</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{biz.description}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { icon: MapPin, label: biz.address + ", " + biz.city },
                { icon: Phone, label: biz.phone },
                { icon: Clock, label: biz.hours },
                { icon: Star, label: `${biz.rating} (${biz.reviewCount} reseñas)` },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-2 text-slate-600">
                  <Icon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4 flex-wrap">
              {biz.tags.map((tag) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>

          {/* Servicios */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Servicios disponibles</h2>
            <div className="space-y-3">
              {biz.services.map((svc) => (
                <div
                  key={svc.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-semibold text-slate-900">{svc.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{svc.description}</p>
                    <p className="text-xs text-slate-400 mt-1">{svc.duration} min</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-900">
                        {svc.price === 0 ? "Gratis" : `$${svc.price.toLocaleString()}`}
                      </p>
                    </div>
                    <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
                      Agendar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha — panel de reserva */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-20">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Agendar cita</h2>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Servicio</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                  {biz.services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.price === 0 ? "Gratis" : `$${s.price}`}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Fecha</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Hora disponible</label>
                <div className="grid grid-cols-3 gap-2">
                  {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((t) => (
                    <button
                      key={t}
                      className="py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer first:bg-indigo-600 first:text-white first:border-indigo-600"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Nota (opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Instrucciones o preferencias..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-400"
                />
              </div>

              <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                Confirmar reserva
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              Reserva gratuita, cancela cuando quieras
            </div>
          </div>

          {/* Calificacion rapida */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{biz.rating}</p>
                <div className="flex gap-0.5 mt-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(biz.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}`} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{biz.reviewCount} reseñas</p>
                <p className="text-xs text-slate-500">Verificadas por Aionios</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
