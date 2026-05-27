import Link from "next/link";
import { Search, Star, MapPin, Clock, SlidersHorizontal } from "lucide-react";
import { BUSINESSES, CATEGORIES } from "@/lib/mock-businesses";

const categoryColors: Record<string, string> = {
  belleza:      "bg-pink-50 text-pink-700 border-pink-200",
  construccion: "bg-orange-50 text-orange-700 border-orange-200",
  tintoreria:   "bg-cyan-50 text-cyan-700 border-cyan-200",
  salud:        "bg-emerald-50 text-emerald-700 border-emerald-200",
  educacion:    "bg-amber-50 text-amber-700 border-amber-200",
  hogar:        "bg-slate-50 text-slate-700 border-slate-200",
  tecnologia:   "bg-violet-50 text-violet-700 border-violet-200",
  fotografia:   "bg-slate-50 text-slate-700 border-slate-300",
};

export default function ExplorarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Explorar negocios</h1>
        <p className="text-slate-500 text-sm mt-0.5">{BUSINESSES.length} negocios disponibles</p>
      </div>

      {/* Barra de filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Busca por nombre o servicio..."
            className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer font-medium">
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Chips de categorias */}
      <div className="flex gap-2 flex-wrap">
        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-medium cursor-pointer">
          Todos
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 rounded-xl text-xs font-medium cursor-pointer transition-colors"
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de negocios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {BUSINESSES.map((biz) => (
          <Link
            key={biz.id}
            href={`/portal/negocio/${biz.id}`}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all group"
          >
            {/* Banner */}
            <div className={`h-28 bg-gradient-to-br ${biz.gradient} relative flex items-end p-4`}>
              <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center text-xl font-bold text-slate-700">
                {biz.name.charAt(0)}
              </div>
              {biz.openNow
                ? <span className="absolute top-3 right-3 text-xs font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Abierto</span>
                : <span className="absolute top-3 right-3 text-xs font-semibold bg-slate-700/60 text-white px-2 py-0.5 rounded-full">Cerrado</span>
              }
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{biz.name}</p>
                  <span className={`inline-block mt-1 text-xs font-medium border px-2 py-0.5 rounded-full ${categoryColors[biz.categorySlug] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {biz.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-slate-900">{biz.rating}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{biz.description}</p>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{biz.city}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />{biz.hours}
                </span>
              </div>

              <div className="flex gap-1 mt-3 flex-wrap">
                {biz.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
