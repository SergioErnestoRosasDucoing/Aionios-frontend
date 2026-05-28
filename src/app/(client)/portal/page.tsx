"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Phone, ChevronRight, TrendingUp } from "lucide-react";
import { businessService } from "@/services/business.service";
import type { Business } from "@/types/business.types";
import { CATEGORIES } from "@/lib/mock-businesses";

const categoryIcons: Record<string, string> = {
  belleza:      "✦",
  construccion: "◈",
  tintoreria:   "◉",
  salud:        "◎",
  educacion:    "◆",
  hogar:        "◇",
  tecnologia:   "◐",
  fotografia:   "◑",
};

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

function FeaturedSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
          <div className="h-24 bg-slate-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
          <div className="w-14 h-14 bg-slate-200 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PortalHome() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading]       = useState(true);
  const [heroSearch, setHeroSearch] = useState("");

  useEffect(() => {
    businessService
      .getAll()
      .then(setBusinesses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleHeroSearch() {
    const q = heroSearch.trim();
    router.push(q ? `/portal/explorar?q=${encodeURIComponent(q)}` : "/portal/explorar");
  }

  const featured = businesses.slice(0, 4);
  const recent   = businesses.slice(4);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative bg-slate-900 rounded-3xl overflow-hidden px-8 py-12 md:px-14 md:py-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/25 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-10 w-56 h-56 bg-violet-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl">
          <p className="text-indigo-400 text-sm font-semibold mb-3 uppercase tracking-widest">Tu plataforma de servicios</p>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            Encuentra el servicio<br />
            <span className="text-indigo-400">que necesitas hoy</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg mb-8 max-w-lg">
            Peluquerias, constructoras, tintorerias, clinicas y más — agenda en segundos con negocios verificados.
          </p>
          <div className="flex items-center gap-2 bg-white rounded-2xl p-2 max-w-lg shadow-xl">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleHeroSearch()}
                placeholder="Barberia, electricista, fisioterapia..."
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full py-1.5"
              />
            </div>
            <button
              onClick={handleHeroSearch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer flex-shrink-0"
            >
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Explorar por categoria</h2>
          <Link href="/portal/explorar" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            Ver todas <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/portal/explorar?categoria=${cat.slug}`}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group cursor-pointer"
            >
              <span className="text-2xl">{categoryIcons[cat.slug] ?? "◻"}</span>
              <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-700 text-center leading-tight">
                {cat.label.split(" ")[0]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Negocios destacados</h2>
          </div>
          <Link href="/portal/explorar" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? <FeaturedSkeleton /> : (
          featured.length === 0 ? (
            <p className="text-sm text-slate-400">Aun no hay negocios registrados.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((biz) => (
                <Link
                  key={biz.id}
                  href={`/portal/negocio/${biz.slug}`}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className={`h-24 bg-gradient-to-br ${gradientFor(biz.id)} relative flex items-end p-3`}>
                    <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-lg font-bold text-slate-700">
                      {biz.nombre.charAt(0)}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight">
                      {biz.nombre}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{biz.descripcion}</p>
                    <div className="flex items-center gap-1 mt-3 text-slate-400">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="text-xs truncate">{biz.direccion}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </section>

      {/* Mas negocios */}
      {(loading || recent.length > 0) && (
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Mas opciones cerca de ti</h2>
          {loading ? <RecentSkeleton /> : (
            <div className="space-y-3">
              {recent.map((biz) => (
                <Link
                  key={biz.id}
                  href={`/portal/negocio/${biz.slug}`}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-sm hover:border-slate-300 transition-all group"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${gradientFor(biz.id)} rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
                    {biz.nombre.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {biz.nombre}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{biz.descripcion}</p>
                    <div className="flex items-center gap-1 mt-1 text-slate-400">
                      <Phone className="w-3 h-3" />
                      <span className="text-xs">{biz.telefono_comercial}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
