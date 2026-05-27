import { CalendarDays, ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";

const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const weekDays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
const weekDates = [26, 27, 28, 29, 30, 31, 1];

type AppointmentColor = "indigo" | "emerald" | "violet" | "amber";

interface ScheduleAppointment {
  day: number;
  startHour: number;
  duration: number;
  client: string;
  service: string;
  color: AppointmentColor;
}

const appointments: ScheduleAppointment[] = [
  { day: 0, startHour: 0, duration: 1, client: "Maria Lopez", service: "Corte y peinado", color: "indigo" },
  { day: 0, startHour: 1, duration: 2, client: "Carlos R.", service: "Tinte completo", color: "violet" },
  { day: 1, startHour: 2, duration: 1, client: "Sofia Torres", service: "Manicure", color: "emerald" },
  { day: 2, startHour: 0, duration: 1, client: "Ana Mendez", service: "Corte caballero", color: "indigo" },
  { day: 3, startHour: 3, duration: 1, client: "Luis H.", service: "Tratamiento", color: "amber" },
  { day: 4, startHour: 1, duration: 1, client: "Laura C.", service: "Brushing", color: "violet" },
  { day: 5, startHour: 0, duration: 2, client: "Marta V.", service: "Color completo", color: "emerald" },
];

const colorMap: Record<AppointmentColor, string> = {
  indigo: "bg-indigo-100 border-indigo-300 text-indigo-800",
  emerald: "bg-emerald-100 border-emerald-300 text-emerald-800",
  violet: "bg-violet-100 border-violet-300 text-violet-800",
  amber: "bg-amber-100 border-amber-300 text-amber-800",
};

const upcomingAppointments = [
  { time: "09:00", client: "Maria Lopez", service: "Corte y peinado", duration: "45 min" },
  { time: "10:30", client: "Carlos Ramirez", service: "Tinte completo", duration: "2 h" },
  { time: "12:00", client: "Sofia Torres", service: "Manicure", duration: "40 min" },
];

export default function HorariosPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda y horarios</h1>
          <p className="text-slate-500 text-sm mt-0.5">Semana del 26 de mayo al 1 de junio, 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white">
            {["Dia", "Semana", "Mes"].map((v, i) => (
              <button
                key={v}
                className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  i === 1
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            Nueva cita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendario semanal */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Navegacion */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">Mayo 2026</h2>
            </div>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-3 h-8 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 cursor-pointer">
                Hoy
              </button>
              <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Header dias */}
              <div className="grid grid-cols-8 border-b border-slate-100">
                <div className="p-3" /> {/* columna horas */}
                {weekDays.map((day, i) => (
                  <div key={day} className="p-3 text-center border-l border-slate-100">
                    <p className="text-xs font-medium text-slate-500">{day}</p>
                    <p
                      className={`text-sm font-bold mt-0.5 w-7 h-7 rounded-full flex items-center justify-center mx-auto ${
                        i === 0
                          ? "bg-indigo-600 text-white"
                          : "text-slate-900"
                      }`}
                    >
                      {weekDates[i]}
                    </p>
                  </div>
                ))}
              </div>

              {/* Filas de horas */}
              {hours.map((hour, hIdx) => (
                <div key={hour} className="grid grid-cols-8 border-b border-slate-50 min-h-[52px]">
                  <div className="px-3 py-2 text-xs text-slate-400 text-right font-medium pt-1.5 border-r border-slate-100">
                    {hour}
                  </div>
                  {weekDays.map((_, dIdx) => {
                    const apt = appointments.find(
                      (a) => a.day === dIdx && a.startHour === hIdx
                    );
                    return (
                      <div
                        key={dIdx}
                        className="border-l border-slate-50 relative p-1"
                      >
                        {apt && (
                          <div
                            className={`rounded-lg border text-xs p-1.5 cursor-pointer hover:opacity-80 transition-opacity ${colorMap[apt.color]}`}
                            style={{ minHeight: `${apt.duration * 52 - 8}px` }}
                          >
                            <p className="font-semibold truncate">{apt.client}</p>
                            <p className="opacity-70 truncate">{apt.service}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Proximas citas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Proximas citas</h2>
            <div className="space-y-3">
              {upcomingAppointments.map((apt, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-xs font-bold text-indigo-600">{apt.time}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900">{apt.client}</p>
                    <p className="text-xs text-slate-500 truncate">{apt.service}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-400">{apt.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bloqueo de horas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Bloquear horario</h2>
            <p className="text-xs text-slate-500 mb-4">
              Marca periodos en los que no estaras disponible.
            </p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Fecha</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Desde</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Hasta</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
                Bloquear horario
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
