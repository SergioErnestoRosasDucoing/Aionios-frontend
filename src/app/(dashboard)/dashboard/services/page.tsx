"use client";

import { useState, useEffect } from "react";
import { Scissors, Plus, Search, Clock, DollarSign, MoreHorizontal } from "lucide-react";
import { servicesService } from "@/services/services.service";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import type { Service } from "@/types/service.types";

export default function ServicesPage() {
  const { business, loading: bizLoading } = useMyBusiness();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (bizLoading) return;
    if (!business) { setLoading(false); return; }

    servicesService
      .getByBusiness(business.id)
      .then(setServices)
      .catch(() => setError("No se pudieron cargar los servicios."))
      .finally(() => setLoading(false));
  }, [business, bizLoading]);

  const filtered = services.filter((s) =>
    s.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (mongoId: string) => {
    await servicesService.remove(mongoId);
    setServices((prev) => prev.filter((s) => s._id !== mongoId));
  };

  if (bizLoading || loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catalogo de servicios</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {filtered.length} servicio{filtered.length !== 1 ? "s" : ""} registrado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />
          Nuevo servicio
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">{error}</div>
      )}

      {!business && !error && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
          No tienes un negocio registrado. Crea uno primero desde la seccion <strong>Mi negocio</strong>.
        </div>
      )}

      {/* Busqueda */}
      {business && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar servicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>
        </div>
      )}

      {/* Grid de servicios */}
      {business && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 && !loading ? (
            <p className="col-span-full text-center text-slate-400 py-12">
              {services.length === 0 ? "Aun no tienes servicios. Agrega el primero." : "Sin resultados para tu busqueda."}
            </p>
          ) : (
            filtered.map((svc) => (
              <div
                key={svc._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4 hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-tight">{svc.nombre}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{svc.descripcion}</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Datos */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-slate-700">
                      <DollarSign className="w-3 h-3" />
                      <span className="text-sm font-bold">{svc.precio.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Precio</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-slate-700">
                      <Clock className="w-3 h-3" />
                      <span className="text-sm font-bold">{svc.duracionMinutos}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Min</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end pt-1 border-t border-slate-100 gap-2">
                  <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                    Editar
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => handleDelete(svc._id)}
                    className="text-xs font-medium text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Tarjeta agregar */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-5 flex flex-col items-center justify-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer min-h-[200px]">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Plus className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">Agregar servicio</p>
              <p className="text-xs text-slate-400 mt-0.5">Haz clic para crear uno nuevo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
