import { Scissors, Plus, Search, Clock, DollarSign, MoreHorizontal, Star } from "lucide-react";

const services = [
  {
    id: 1,
    name: "Corte de cabello dama",
    category: "Cortes",
    price: 280,
    duration: 45,
    rating: 4.9,
    bookings: 142,
    active: true,
  },
  {
    id: 2,
    name: "Tinte completo",
    category: "Color",
    price: 850,
    duration: 120,
    rating: 4.8,
    bookings: 98,
    active: true,
  },
  {
    id: 3,
    name: "Manicure clasico",
    category: "Unas",
    price: 180,
    duration: 40,
    rating: 4.7,
    bookings: 210,
    active: true,
  },
  {
    id: 4,
    name: "Tratamiento capilar",
    category: "Tratamientos",
    price: 420,
    duration: 60,
    rating: 4.9,
    bookings: 67,
    active: true,
  },
  {
    id: 5,
    name: "Pedicure spa",
    category: "Unas",
    price: 220,
    duration: 50,
    rating: 4.6,
    bookings: 88,
    active: false,
  },
  {
    id: 6,
    name: "Brushing y peinado",
    category: "Peinados",
    price: 200,
    duration: 35,
    rating: 4.8,
    bookings: 175,
    active: true,
  },
];

const categories = ["Todos", "Cortes", "Color", "Unas", "Tratamientos", "Peinados"];

const categoryColors: Record<string, string> = {
  Cortes: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Color: "bg-violet-50 text-violet-700 border-violet-200",
  Unas: "bg-pink-50 text-pink-700 border-pink-200",
  Tratamientos: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Peinados: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function ServicesPage() {
  const activeCount = services.filter((s) => s.active).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catalogo de servicios</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {activeCount} servicios activos de {services.length} totales
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />
          Nuevo servicio
        </button>
      </div>

      {/* Filtros y busqueda */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Busqueda */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar servicio..."
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>
          {/* Categorias */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  cat === "Todos"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de servicios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((svc) => (
          <div
            key={svc.id}
            className={`bg-white rounded-2xl border p-5 flex flex-col gap-4 transition-all hover:shadow-md ${
              svc.active ? "border-slate-200" : "border-slate-100 opacity-60"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{svc.name}</p>
                  <span
                    className={`inline-block mt-1 text-xs font-medium border px-2 py-0.5 rounded-full ${
                      categoryColors[svc.category] ?? "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {svc.category}
                  </span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Datos */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-slate-700">
                  <DollarSign className="w-3 h-3" />
                  <span className="text-sm font-bold">{svc.price}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Precio</p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-slate-700">
                  <Clock className="w-3 h-3" />
                  <span className="text-sm font-bold">{svc.duration}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Min</p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-amber-600">
                  <Star className="w-3 h-3 fill-amber-500 stroke-none" />
                  <span className="text-sm font-bold text-slate-700">{svc.rating}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Rating</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <p className="text-xs text-slate-400">{svc.bookings} reservas totales</p>
              <div className="flex gap-2">
                <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                  Editar
                </button>
                <span className="text-slate-300">|</span>
                <button
                  className={`text-xs font-medium cursor-pointer ${
                    svc.active
                      ? "text-slate-400 hover:text-rose-500"
                      : "text-emerald-600 hover:text-emerald-700"
                  }`}
                >
                  {svc.active ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Tarjeta para agregar */}
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
    </div>
  );
}
