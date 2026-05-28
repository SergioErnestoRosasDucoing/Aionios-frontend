"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Phone, ChevronLeft, CheckCircle, CalendarDays, Clock } from "lucide-react";
import { businessService } from "@/services/business.service";
import { servicesService } from "@/services/services.service";
import { horariosService } from "@/services/horarios.service";
import { requestsService } from "@/services/requests.service";
import { businessUiService } from "@/services/business-ui.service";
import { useAuth } from "@/context/AuthContext";
import type { Business } from "@/types/business.types";
import type { Service } from "@/types/service.types";
import { formatDuracion, duracionEnMinutos } from "@/types/service.types";
import type { BusinessUiConfig } from "@/types/business-ui.types";

const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
];
const gradientFor = (id: number) => GRADIENTS[id % GRADIENTS.length];

const HOUR_START = 9;
const HOUR_END   = 18;

function generateSlots(duracionMins: number): string[] {
  const slots: string[] = [];
  const step = Math.max(Math.min(duracionMins, HOUR_END * 60 - HOUR_START * 60), 30);
  for (let mins = HOUR_START * 60; mins + step <= HOUR_END * 60; mins += step) {
    const h = Math.floor(mins / 60).toString().padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
  }
  return slots;
}

const UNIDADES_LARGAS = new Set(["dias", "semanas", "meses", "a_convenir"]);

function isBlocked(slot: string, fecha: string, blocks: any[]): boolean {
  return blocks.some((b) => {
    if (!b.fecha || !b.hora_inicio || !b.hora_fin) return false;
    const bDate = b.fecha.split("T")[0];
    if (bDate !== fecha) return false;
    return slot >= b.hora_inicio && slot < b.hora_fin;
  });
}

function toIso(fecha: string, hora: string): string {
  return new Date(`${fecha}T${hora}:00`).toISOString();
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export default function BusinessDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router   = useRouter();
  const { user } = useAuth();

  const [biz,      setBiz]      = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [blocks,   setBlocks]   = useState<any[]>([]);
  const [uiConfig, setUiConfig] = useState<BusinessUiConfig | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  // Booking form state
  const [selectedSvc,  setSelectedSvc]  = useState("");
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedTime, setSelectedTime] = useState("");
  const [nota,         setNota]         = useState("");
  const [booking,      setBooking]      = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [booked,       setBooked]       = useState(false);

  useEffect(() => {
    if (!slug) { setNotFoundError(true); return; }

    businessService.getBySlug(slug)
      .then((bizData) => {
        const negocioId = bizData.id;
        return Promise.all([
          Promise.resolve(bizData),
          servicesService.getByBusiness(negocioId),
          horariosService.getByNegocio(negocioId).catch(() => null),
          businessUiService.getByNegocio(negocioId).catch(() => null),
        ]);
      })
      .then(([bizData, svcData, horario, uiData]) => {
        setBiz(bizData);
        setServices(svcData);
        setBlocks(horario?.excepciones_y_festivos ?? []);
        setUiConfig(uiData);
        if (svcData.length > 0) setSelectedSvc(svcData[0]._id);
      })
      .catch((err) => {
        console.error("[negocio] Error cargando slug:", slug, err?.response?.status, err?.response?.data);
        setNotFoundError(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const currentSvc = useMemo(
    () => services.find((s) => s._id === selectedSvc),
    [services, selectedSvc],
  );

  const isLongService = currentSvc ? UNIDADES_LARGAS.has(currentSvc.unidadDuracion) : false;

  const slots = useMemo(() => {
    if (!currentSvc || isLongService) return [];
    const mins = duracionEnMinutos(currentSvc.duracion, currentSvc.unidadDuracion);
    const all = generateSlots(mins);
    return all.map((slot) => ({
      time: slot,
      blocked: isBlocked(slot, selectedDate, blocks),
    }));
  }, [currentSvc, isLongService, selectedDate, blocks]);

  useEffect(() => {
    const available = slots.filter((s) => !s.blocked);
    if (selectedTime && slots.find((s) => s.time === selectedTime)?.blocked) {
      setSelectedTime(available[0]?.time ?? "");
    } else if (!selectedTime && available.length > 0) {
      setSelectedTime(available[0].time);
    }
  }, [slots]);

  const handleBook = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    const horaFinal = isLongService ? "09:00" : selectedTime;
    if (!selectedSvc || !selectedDate || (!isLongService && !horaFinal)) {
      setBookingError("Selecciona un servicio y fecha.");
      return;
    }
    if (selectedDate < todayStr()) {
      setBookingError("No puedes agendar en una fecha pasada.");
      return;
    }
    setBooking(true);
    setBookingError(null);
    try {
      await requestsService.create({
        id_usuario:           user.id,
        id_negocio:           biz!.id,
        id_servicio_nosql:    selectedSvc,
        fecha_hora_propuesta: toIso(selectedDate, horaFinal),
      });
      setBooked(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setBookingError(typeof msg === "string" ? msg : "No se pudo agendar. Intenta de nuevo.");
    } finally {
      setBooking(false);
    }
  };

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

  if (notFoundError || !biz) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Link href="/portal/explorar" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Volver a explorar
        </Link>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl mb-4">🏪</p>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Negocio no encontrado</h2>
          <p className="text-slate-500 text-sm">Este negocio no existe o la URL es incorrecta.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link href="/portal/explorar" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Volver a explorar
      </Link>

      {/* Banner */}
      <div
        className="relative rounded-3xl overflow-hidden h-40 md:h-52 flex items-end p-6"
        style={
          uiConfig?.color_primario
            ? { background: `linear-gradient(135deg, ${uiConfig.color_primario}, ${uiConfig.color_primario}99)` }
            : undefined
        }
      >
        {!uiConfig?.color_primario && (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientFor(biz.id)}`} />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex items-end gap-4">
          <div
            className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl font-bold flex-shrink-0"
            style={{ color: uiConfig?.color_primario ?? "#334155" }}
          >
            {biz.nombre.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{biz.nombre}</h1>
            {uiConfig?.slogan ? (
              <p className="text-white/90 text-sm italic mt-0.5">{uiConfig.slogan}</p>
            ) : (
              <p className="text-white/80 text-sm">{biz.direccion}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-5">
          {/* Info general */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Sobre el negocio</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {uiConfig?.descripcion_corta || biz.descripcion}
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs">{biz.direccion}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs">{biz.telefono_comercial}</span>
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Servicios disponibles</h2>
            {services.length === 0 ? (
              <p className="text-sm text-slate-400">Este negocio aún no tiene servicios registrados.</p>
            ) : (
              <div className="space-y-3">
                {services.map((svc) => (
                  <div
                    key={svc._id}
                    onClick={() => setSelectedSvc(svc._id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedSvc === svc._id
                        ? "border-indigo-300 bg-indigo-50/50"
                        : "border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30"
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-semibold text-slate-900">{svc.nombre}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{svc.descripcion}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400">{formatDuracion(svc.duracion, svc.unidadDuracion)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p className="text-base font-bold text-slate-900">
                        {svc.precio === 0 ? "Gratis" : `$${svc.precio.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel de reserva */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-20">
            {booked ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900">¡Solicitud enviada!</p>
                  <p className="text-xs text-slate-500 mt-1">
                    El negocio confirmará tu cita a la brevedad.
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-left space-y-1">
                  <p className="text-xs font-semibold text-slate-700">{currentSvc?.nombre}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {new Date(`${selectedDate}T09:00`).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                    {!isLongService && ` · ${selectedTime}`}
                  </div>
                </div>
                <button
                  onClick={() => { setBooked(false); setSelectedTime(""); setNota(""); }}
                  className="w-full py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                >
                  Agendar otra cita
                </button>
                <Link
                  href="/portal/citas"
                  className="block w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors text-center"
                >
                  Ver mis citas
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-base font-semibold text-slate-900 mb-4">Agendar cita</h2>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Servicio</label>
                    <select
                      value={selectedSvc}
                      onChange={(e) => { setSelectedSvc(e.target.value); setSelectedTime(""); }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
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
                      value={selectedDate}
                      min={todayStr()}
                      onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(""); }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {isLongService ? (
                    <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-700">
                      Este servicio tiene una duración de <strong>{currentSvc && formatDuracion(currentSvc.duracion, currentSvc.unidadDuracion)}</strong>. El negocio coordinará contigo el horario de inicio.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Hora disponible</label>
                      {slots.length === 0 ? (
                        <p className="text-xs text-slate-400">No hay horarios para este servicio.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map(({ time, blocked }) => (
                            <button
                              key={time}
                              disabled={blocked}
                              onClick={() => setSelectedTime(time)}
                              className={`py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                selectedTime === time
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : blocked
                                  ? "border-slate-200 text-slate-300 bg-slate-50"
                                  : "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Nota (opcional)</label>
                    <textarea
                      rows={2}
                      value={nota}
                      onChange={(e) => setNota(e.target.value)}
                      placeholder="Instrucciones o preferencias..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-400"
                    />
                  </div>

                  {bookingError && (
                    <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
                      {bookingError}
                    </div>
                  )}

                  {!user && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-700">
                      Debes <Link href="/login" className="font-semibold underline">iniciar sesión</Link> para agendar.
                    </div>
                  )}

                  <button
                    onClick={handleBook}
                    disabled={booking || services.length === 0 || (!isLongService && !selectedTime)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    {booking ? "Enviando..." : "Confirmar reserva"}
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Reserva gratuita, cancela cuando quieras
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
