import { Building2, MapPin, Phone, Globe, Clock, Upload, ChevronRight } from "lucide-react";

const rubros = [
  "Salon de belleza",
  "Barberia",
  "Spa y masajes",
  "Clinica estetica",
  "Consultorio medico",
  "Estudio de tatuajes",
  "Fotografo",
  "Otro",
];

const horarios = [
  { dia: "Lunes", abre: "09:00", cierra: "18:00", activo: true },
  { dia: "Martes", abre: "09:00", cierra: "18:00", activo: true },
  { dia: "Miercoles", abre: "09:00", cierra: "18:00", activo: true },
  { dia: "Jueves", abre: "09:00", cierra: "18:00", activo: true },
  { dia: "Viernes", abre: "09:00", cierra: "20:00", activo: true },
  { dia: "Sabado", abre: "10:00", cierra: "16:00", activo: true },
  { dia: "Domingo", abre: "", cierra: "", activo: false },
];

export default function BusinessPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi negocio</h1>
        <p className="text-slate-500 text-sm mt-0.5">Configura el perfil publico de tu negocio</p>
      </div>

      {/* Tarjeta perfil */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">Informacion general</h2>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold">
            N
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-1">Logo del negocio</p>
            <p className="text-xs text-slate-500 mb-3">PNG, JPG o WebP. Maximo 2 MB.</p>
            <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Subir imagen
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Nombre del negocio</label>
            <input
              defaultValue="Salon Bella Vista"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Rubro</label>
            <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm cursor-pointer">
              {rubros.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Telefono</span>
            </label>
            <input
              defaultValue="+52 555 123 4567"
              type="tel"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Sitio web</span>
            </label>
            <input
              defaultValue="www.salonbellavista.com"
              type="url"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Direccion</span>
            </label>
            <input
              defaultValue="Av. Insurgentes Sur 1234, Col. Del Valle, Ciudad de Mexico"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Descripcion</label>
            <textarea
              rows={3}
              defaultValue="Somos un salon de belleza profesional con mas de 10 anos de experiencia ofreciendo servicios de corte, color, tratamientos y estilismo."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
            />
          </div>
        </div>
      </div>

      {/* Horarios de atencion */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">Horarios de atencion</h2>
        </div>

        <div className="space-y-2">
          {horarios.map((h) => (
            <div
              key={h.dia}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center gap-3 w-28">
                <div className={`w-2 h-2 rounded-full ${h.activo ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span className="text-sm font-medium text-slate-700">{h.dia}</span>
              </div>
              {h.activo ? (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    defaultValue={h.abre}
                    type="time"
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-slate-400">—</span>
                  <input
                    defaultValue={h.cierra}
                    type="time"
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-medium">Cerrado</span>
              )}
              <div className={`w-9 h-5 rounded-full cursor-pointer transition-colors ${h.activo ? "bg-indigo-600" : "bg-slate-200"}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm mt-0.5 transition-transform ${h.activo ? "translate-x-4.5 ml-0.5" : "translate-x-0.5 ml-0"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guardar */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-400">Los cambios se aplican de forma inmediata</p>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
            Cancelar
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
            Guardar cambios
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
