"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Phone, ChevronLeft, CheckCircle } from "lucide-react";
import { businessService } from "@/services/business.service";
import { servicesService } from "@/services/services.service";
import type { Business } from "@/types/business.types";
import type { Service } from "@/types/service.types";

const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
];
const gradientFor = (id: number) => GRADIENTS[id % GRADIENTS.length];

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = parseInt(id, 10);

  const [biz, setBiz] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    if (isNaN(numericId)) { setNotFoundError(true); return; }

    Promise.all([
      businessService.getById(numericId),
      servicesService.getByBusiness(numericId),
    ])
      .then(([bizData, svcData]) => {
        setBiz(bizData);
        setServices(svcData);
      })
      .catch(() => setNotFoundError(true))
      .finally(() => setLoading(false));
  }, [numericId]);

  if (notFoundError) notFound();

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-40 md:h-52 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 bg-slate-100 rounded-2xl" />
            <div className="h-64 bg-slate-100 rounded-2xl" />
          </div>
          <div className="h-80 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!biz) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link href="/portal/explorar" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Volver a explorar
      </Link>

      {/* Banner */}
      <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${gradientFor(biz.id)} h-40 md:h-52 flex items-end p-6`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex items-end gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl font-bold text-slate-700 flex-shrink-0">
            {biz.nombre.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{biz.nombre}</h1>
            <p className="text-white/80 text-sm">{biz.direccion}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-5">
          {/* Info general */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Sobre el negocio</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{biz.descripcion}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs">{biz.direccion}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs">{biz.telefono}</span>
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Servicios disponibles</h2>
            {services.length === 0 ? (
              <p className="text-sm text-slate-400">Este negocio aun no tiene servicios registrados.</p>
            ) : (
              <div className="space-y-3">
                {services.map((svc) => (
                  <div
                    key={svc._id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-semibold text-slate-900">{svc.nombre}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{svc.descripcion}</p>
                      <p className="text-xs text-slate-400 mt-1">{svc.duracionMinutos} min</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p className="text-base font-bold text-slate-900">
                        {svc.precio === 0 ? "Gratis" : `$${svc.precio.toLocaleString()}`}
                      </p>
                      <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
                        Agendar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha — panel de reserva */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-20">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Agendar cita</h2>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Servicio</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                  {services.length === 0
                    ? <option disabled>Sin servicios disponibles</option>
                    : services.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.nombre} — {s.precio === 0 ? "Gratis" : `$${s.precio}`}
                        </option>
                      ))
                  }
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

              <button
                disabled={services.length === 0}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                Confirmar reserva
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              Reserva gratuita, cancela cuando quieras
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
