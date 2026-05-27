"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Phone, SlidersHorizontal } from "lucide-react";
import { businessService } from "@/services/business.service";
import type { Business } from "@/types/business.types";
import { CATEGORIES } from "@/lib/mock-businesses";

const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-teal-500 to-emerald-600",
];
const gradientFor = (id: number) => GRADIENTS[id % GRADIENTS.length];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  belleza:      ["belleza", "salon", "spa", "estetica", "cosmet", "cabello", "peluquer", "uñas", "manicure", "pedicure"],
  construccion: ["construc", "remodelacion", "plomeria", "electricid", "pintura", "albañil"],
  tintoreria:   ["tintoreria", "lavanderia", "ropa", "limpieza en seco"],
  salud:        ["salud", "fisioterapia", "medico", "clinica", "rehabilitacion", "optica", "dental", "nutricion"],
  educacion:    ["educacion", "academia", "ingles", "idioma", "tutor", "clase", "curso"],
  hogar:        ["hogar", "mantenimiento", "plomero", "electricista", "jardin", "mudanza"],
  tecnologia:   ["tecnologia", "reparacion", "celular", "laptop", "computadora", "software"],
  fotografia:   ["fotografi", "estudio", "foto", "video", "retrato"],
};

export default function ExplorarPage() {
  const searchParams = useSearchParams();

  const [businesses, setBusinesses]           = useState<Business[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [search, setSearch]                   = useState(searchParams.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("categoria"));

  useEffect(() => {
    businessService
      .getAll()
      .then(setBusinesses)
      .catch(() => setError("No se pudieron cargar los negocios."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = businesses.filter((b) => {
    const text = `${b.nombre} ${b.descripcion ?? ""}`.toLowerCase();
    const matchesSearch   = !search || text.includes(search.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      (CATEGORY_KEYWORDS[selectedCategory]?.some((kw) => text.includes(kw)) ?? false);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Explorar negocios</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {loading ? "Cargando..." : `${filtered.length} negocio${filtered.length !== 1 ? "s" : ""} disponible${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Busca por nombre o servicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={() => { setSearch(""); setSelectedCategory(null); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer font-medium"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Limpiar filtros
        </button>
      </div>

      {/* Chips de categorias */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
            !selectedCategory
              ? "bg-indigo-600 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
          }`}
        >
          Todos
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategory(cat.slug === selectedCategory ? null : cat.slug)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              selectedCategory === cat.slug
                ? "bg-indigo-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">{error}</div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-28 bg-slate-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length === 0 ? (
            <p className="col-span-full text-center text-slate-400 py-16">
              {selectedCategory
                ? "No se encontraron negocios en esta categoría."
                : "No se encontraron negocios."}
            </p>
          ) : (
            filtered.map((biz) => (
              <Link
                key={biz.id}
                href={`/portal/negocio/${biz.id}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div className={`h-28 bg-gradient-to-br ${gradientFor(biz.id)} relative flex items-end p-4`}>
                  <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center text-xl font-bold text-slate-700">
                    {biz.nombre.charAt(0)}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors mb-1">
                    {biz.nombre}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{biz.descripcion}</p>
                  <div className="flex flex-col gap-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{biz.direccion}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      {biz.telefono_comercial}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
