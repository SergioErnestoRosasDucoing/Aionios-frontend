"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CalendarDays, Plus, Clock, CheckCircle, XCircle,
  MapPin, ChevronRight, Loader2, CreditCard, X,
  DollarSign, Banknote, Smartphone, Star, MessageSquare,
  CalendarClock, Building2, Scissors,
} from "lucide-react";
import { requestsService } from "@/services/requests.service";
import { servicesService } from "@/services/services.service";
import RequestChat from "@/components/ui/RequestChat";
import { paymentsService } from "@/services/payments.service";
import { reviewsService } from "@/services/reviews.service";
import { useAuth } from "@/context/AuthContext";
import type { SolicitudCliente } from "@/types/request.types";
import type { Service } from "@/types/service.types";
import type { Review } from "@/types/review.types";

const ESTADO_CONFIG = {
  PENDIENTE:  { label: "Pendiente",  icon: Clock,       cls: "text-amber-700 bg-amber-50 border-amber-200"       },
  CONFIRMADA: { label: "Confirmada", icon: CheckCircle, cls: "text-emerald-700 bg-emerald-50 border-emerald-200"  },
  CANCELADA:  { label: "Cancelada",  icon: XCircle,     cls: "text-rose-700 bg-rose-50 border-rose-200"           },
} as const;

const METODOS = [
  { value: "efectivo",      label: "Efectivo",      icon: Banknote   },
  { value: "tarjeta",       label: "Tarjeta",       icon: CreditCard },
  { value: "transferencia", label: "Transferencia", icon: Smartphone },
] as const;

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function isUpcomingDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

function isPaid(cita: SolicitudCliente) {
  return cita.pagos.some((p) => p.estado_pago === "COMPLETADO");
}

function isAConvenir(svc: Service | undefined) {
  return svc?.unidadDuracion === "a_convenir";
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          className="cursor-pointer"
        >
          <Star className={`w-8 h-8 transition-colors ${
            n <= (hover || value) ? "fill-amber-400 text-amber-400" : "text-slate-200"
          }`} />
        </button>
      ))}
    </div>
  );
}

// ── Tarjeta de cita (clickable) ───────────────────────────────────────────────
function CitaCard({
  cita, svc, onClick,
}: {
  cita: SolicitudCliente;
  svc: Service | undefined;
  onClick: () => void;
}) {
  const cfg      = ESTADO_CONFIG[cita.estado];
  const Icon     = cfg.icon;
  const convenir = isAConvenir(svc);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 cursor-pointer hover:border-indigo-200 hover:shadow-sm transition-all"
    >
      {/* Bloque de fecha / a convenir */}
      {convenir ? (
        <div className="w-[52px] flex-shrink-0 flex flex-col items-center gap-1">
          <CalendarClock className="w-7 h-7 text-indigo-400" />
          <p className="text-[10px] text-indigo-500 font-semibold text-center leading-tight">A convenir</p>
        </div>
      ) : (
        <div className="text-center min-w-[52px] flex-shrink-0">
          <p className="text-2xl font-bold text-indigo-600 leading-none">
            {new Date(cita.fecha_hora_propuesta).getDate()}
          </p>
          <p className="text-xs text-slate-500 uppercase mt-0.5">
            {new Date(cita.fecha_hora_propuesta).toLocaleDateString("es-MX", { month: "short" })}
          </p>
        </div>
      )}

      <div className="w-px h-12 bg-slate-100 flex-shrink-0" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{cita.negocio.nombre}</p>
        <p className="text-xs text-slate-500 truncate">{svc?.nombre ?? "Servicio"}</p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {!convenir && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {formatHora(cita.fecha_hora_propuesta)} — {formatFecha(cita.fecha_hora_propuesta)}
            </span>
          )}
          {cita.negocio.direccion && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="w-3 h-3" />
              {cita.negocio.direccion}
            </span>
          )}
        </div>
      </div>

      {/* Estado + chevron */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded-full ${cfg.cls}`}>
          <Icon className="w-3 h-3" />
          {cfg.label}
        </span>
        {convenir && cita.estado !== "CANCELADA" && (
          <span className="inline-flex items-center gap-1 text-xs text-indigo-500 font-medium">
            <MessageSquare className="w-3 h-3" />
            Coordinar
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </div>
    </div>
  );
}

// ── Modal de detalle ──────────────────────────────────────────────────────────
function DetailModal({
  cita, svc, myReview, userId, userName,
  onClose, onPay, onReview,
  paying, payError,
  reviewing, revError,
  metodo, setMetodo, monto, setMonto, precio,
  rating, setRating, comentario, setComentario,
  handlePay, handleReview,
  setCitas,
}: {
  cita: SolicitudCliente;
  svc: Service | undefined;
  myReview: Review | undefined;
  userId: number;
  userName: string;
  onClose: () => void;
  onPay: () => void;
  onReview: () => void;
  paying: boolean;
  payError: string | null;
  reviewing: boolean;
  revError: string | null;
  metodo: string;
  setMetodo: (v: string) => void;
  monto: string;
  setMonto: (v: string) => void;
  precio: number;
  rating: number;
  setRating: (v: number) => void;
  comentario: string;
  setComentario: (v: string) => void;
  handlePay: () => void;
  handleReview: () => void;
  setCitas: React.Dispatch<React.SetStateAction<SolicitudCliente[]>>;
}) {
  const [tab, setTab] = useState<"info" | "chat" | "pay" | "review">("info");
  const cfg      = ESTADO_CONFIG[cita.estado];
  const StatusIcon = cfg.icon;
  const convenir = isAConvenir(svc);
  const paid     = isPaid(cita);
  const isPast   = !isUpcomingDate(cita.fecha_hora_propuesta) && !convenir;
  const canPay   = cita.estado === "CONFIRMADA" && !isPast && !paid;
  const canReview = isPast && cita.estado === "CONFIRMADA" && !myReview;

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{cita.negocio.nombre}</h2>
              <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded-full ${cfg.cls}`}>
                <StatusIcon className="w-3 h-3" />
                {cfg.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Solicitud #{cita.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-slate-100 px-5 flex-shrink-0">
          {[
            { key: "info",   label: "Detalles", show: true },
            { key: "chat",   label: "Coordinar", show: convenir && cita.estado !== "CANCELADA" },
            { key: "pay",    label: "Pagar",     show: canPay },
            { key: "review", label: "Reseñar",   show: canReview },
          ].filter((t) => t.show).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "info" && (
            <div className="space-y-4">
              {/* Servicio */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <Scissors className="w-3.5 h-3.5" />
                  Servicio
                </div>
                <p className="text-sm font-semibold text-slate-900">{svc?.nombre ?? "—"}</p>
                {svc?.descripcion && (
                  <p className="text-xs text-slate-500">{svc.descripcion}</p>
                )}
                <div className="flex items-center gap-4 flex-wrap">
                  {svc?.precio != null && (
                    <span className="text-xs text-slate-600">
                      💰 <span className="font-medium">${svc.precio.toLocaleString()}</span>
                    </span>
                  )}
                  {svc?.duracion != null && !convenir && (
                    <span className="text-xs text-slate-600">
                      ⏱ <span className="font-medium">{svc.duracion} {svc.unidadDuracion}</span>
                    </span>
                  )}
                  {convenir && (
                    <span className="text-xs text-indigo-600 font-medium">
                      ⏱ A convenir
                    </span>
                  )}
                </div>
              </div>

              {/* Fecha / hora o "A convenir" */}
              {convenir ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <CalendarClock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Horario a convenir</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Usa la pestaña "Coordinar" para chatear con el negocio y definir fecha y hora.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Fecha y hora
                  </div>
                  <p className="text-sm font-semibold text-slate-900 capitalize">
                    {formatFecha(cita.fecha_hora_propuesta)}
                  </p>
                  <p className="text-xs text-slate-600">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatHora(cita.fecha_hora_propuesta)}
                  </p>
                </div>
              )}

              {/* Negocio */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5" />
                  Negocio
                </div>
                <p className="text-sm font-semibold text-slate-900">{cita.negocio.nombre}</p>
                {cita.negocio.direccion && (
                  <p className="text-xs text-slate-500">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {cita.negocio.direccion}
                  </p>
                )}
                <Link href={`/portal/negocio/${cita.negocio.slug}`}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1"
                >
                  Ver perfil del negocio <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Pago */}
              {paid && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">Pago registrado</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      ${cita.pagos.find((p) => p.estado_pago === "COMPLETADO")?.monto.toLocaleString()} —{" "}
                      {cita.pagos.find((p) => p.estado_pago === "COMPLETADO")?.metodo_pago}
                    </p>
                  </div>
                </div>
              )}

              {/* Mi reseña */}
              {myReview && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-800 mb-1">Tu reseña</p>
                  <p className="text-amber-500 text-sm">{"★".repeat(myReview.rating)}{"☆".repeat(5 - myReview.rating)}</p>
                  {myReview.comentario && <p className="text-xs text-amber-700 mt-1">{myReview.comentario}</p>}
                </div>
              )}

            </div>
          )}

          {tab === "chat" && (
            <RequestChat
              solicitudId={cita.id}
              autorId={userId}
              autorNombre={userName}
              autorTipo="cliente"
            />
          )}

          {tab === "pay" && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                <p className="text-sm font-semibold text-slate-800">{cita.negocio.nombre}</p>
                <p className="text-xs text-slate-500">{svc?.nombre ?? "Servicio"}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Método de pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {METODOS.map(({ value, label, icon: Icon }) => (
                    <button key={value} onClick={() => setMetodo(value)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                        metodo === value
                          ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/40"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Monto a pagar</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input type="text" readOnly aria-label="Monto a pagar" value={precio > 0 ? precio.toLocaleString() : monto}
                    className="w-full pl-7 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700 cursor-not-allowed select-none"
                  />
                </div>
                <p className="text-xs text-slate-400">El monto corresponde al precio del servicio contratado.</p>
              </div>

              {payError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">{payError}</div>
              )}

              <button onClick={handlePay} disabled={paying}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {paying ? "Guardando..." : "Confirmar pago"}
              </button>
            </div>
          )}

          {tab === "review" && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                <p className="text-sm font-semibold text-slate-800">{cita.negocio.nombre}</p>
                <p className="text-xs text-slate-500">{svc?.nombre ?? "Servicio"}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Calificación</label>
                <StarPicker value={rating} onChange={setRating} />
                <p className="text-xs text-slate-400">
                  {["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"][rating]}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Comentario (opcional)</label>
                <textarea rows={3} value={comentario} onChange={(e) => setComentario(e.target.value)}
                  placeholder="Cuéntanos tu experiencia..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-400"
                />
              </div>

              {revError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">{revError}</div>
              )}

              <button onClick={handleReview} disabled={reviewing || rating === 0}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {reviewing ? "Enviando..." : "Publicar reseña"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sección con título ────────────────────────────────────────────────────────
function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">{title} ({count})</h2>
      {children}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function CitasPage() {
  const { user } = useAuth();

  const [citas,    setCitas]    = useState<SolicitudCliente[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<"proximas" | "historial">("proximas");

  const [selected, setSelected] = useState<SolicitudCliente | null>(null);

  // Pay state
  const [metodo,     setMetodo]     = useState("efectivo");
  const [monto,      setMonto]      = useState("");
  const [paying,     setPaying]     = useState(false);
  const [payError,   setPayError]   = useState<string | null>(null);

  // Review state
  const [rating,     setRating]     = useState(5);
  const [comentario, setComentario] = useState("");
  const [reviewing,  setReviewing]  = useState(false);
  const [revError,   setRevError]   = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      requestsService.getMine().catch(() => [] as SolicitudCliente[]),
      servicesService.getAll().catch(() => [] as Service[]),
      reviewsService.getMine().catch(() => [] as Review[]),
    ])
      .then(([reqs, svcs, revs]) => { setCitas(reqs); setServices(svcs); setReviews(revs); })
      .finally(() => setLoading(false));
  }, []);

  const serviceFor = (mongoId: string) => services.find((s) => s._id === mongoId);
  const reviewFor  = (negocioId: number) => reviews.find((r) => r.negocio_id === negocioId);

  // ── Clasificación ─────────────────────────────────────────────────────────
  const isProxima = (c: SolicitudCliente) => {
    const svc = serviceFor(c.id_servicio_nosql);
    if (isAConvenir(svc)) return c.estado !== "CANCELADA";
    return isUpcomingDate(c.fecha_hora_propuesta) && c.estado !== "CANCELADA";
  };

  const proximas  = citas.filter(isProxima);
  const historial = citas.filter((c) => !isProxima(c));

  const confirmadas = proximas.filter((c) => c.estado === "CONFIRMADA");
  const pendientes  = proximas.filter((c) => c.estado === "PENDIENTE");

  const displayed = tab === "proximas" ? proximas : historial;

  // ── Computed for selected modal ────────────────────────────────────────────
  const selectedSvc   = selected ? serviceFor(selected.id_servicio_nosql) : undefined;
  const selectedRev   = selected ? reviewFor(selected.id_negocio) : undefined;
  const selectedPrecio = selectedSvc?.precio ?? 0;

  function openDetail(cita: SolicitudCliente) {
    const svc = serviceFor(cita.id_servicio_nosql);
    setSelected(cita);
    setMetodo("efectivo");
    setMonto(svc?.precio != null && svc.precio > 0 ? String(svc.precio) : "");
    setPayError(null);
    setRating(5);
    setComentario("");
    setRevError(null);
  }

  // ── Pago ──────────────────────────────────────────────────────────────────
  async function handlePay() {
    if (!selected) return;
    const amount = selectedPrecio > 0 ? selectedPrecio : parseFloat(monto);
    if (!amount || isNaN(amount) || amount <= 0) { setPayError("No se pudo determinar el monto del servicio."); return; }
    setPaying(true); setPayError(null);
    try {
      const pago = await paymentsService.create({
        id_cita: selected.id, monto: amount, metodo_pago: metodo, estado_pago: "COMPLETADO",
      });
      const updated: SolicitudCliente = {
        ...selected,
        pagos: [...selected.pagos, { id: pago.id, monto: pago.monto, metodo_pago: pago.metodo_pago, estado_pago: "COMPLETADO" }],
      };
      setCitas((prev) => prev.map((c) => c.id === selected.id ? updated : c));
      setSelected(updated);
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message;
      setPayError(typeof msg === "string" ? msg : "No se pudo registrar el pago.");
    } finally { setPaying(false); }
  }

  // ── Reseña ────────────────────────────────────────────────────────────────
  async function handleReview() {
    if (!selected || !user) return;
    if (rating < 1) { setRevError("Selecciona una calificación."); return; }
    setReviewing(true); setRevError(null);
    try {
      const rev = await reviewsService.create({
        negocio_id:    selected.id_negocio,
        usuario_id:    user.id,
        nombre_cliente:`${user.nombre}`,
        rating,
        comentario,
        fecha:         new Date().toISOString(),
      });
      setReviews((prev) => [...prev, rev]);
      setSelected(null);
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message;
      setRevError(typeof msg === "string" ? msg : "No se pudo enviar la reseña.");
    } finally { setReviewing(false); }
  }

  const handleClose = useCallback(() => setSelected(null), []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis citas</h1>
          <p className="text-slate-500 text-sm mt-0.5">Historial y próximas citas agendadas</p>
        </div>
        <Link href="/portal/explorar"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva cita
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {([
          { key: "proximas",  label: `Próximas (${proximas.length})`   },
          { key: "historial", label: `Historial (${historial.length})` },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
          <CalendarDays className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-700 font-semibold text-base">
            {tab === "proximas" ? "No tienes citas próximas" : "Sin historial de citas"}
          </p>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            {tab === "proximas"
              ? "Cuando agendes una cita con algún negocio, aparecerá aquí."
              : "Tus citas pasadas y canceladas aparecerán aquí."}
          </p>
          {tab === "proximas" && (
            <Link href="/portal/explorar"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Explorar negocios
            </Link>
          )}
        </div>
      ) : tab === "proximas" ? (
        <div className="space-y-6">
          <Section title="Confirmadas" count={confirmadas.length}>
            {confirmadas.map((cita) => (
              <CitaCard
                key={cita.id}
                cita={cita}
                svc={serviceFor(cita.id_servicio_nosql)}
                onClick={() => openDetail(cita)}
              />
            ))}
          </Section>

          <Section title="Pendientes de confirmación" count={pendientes.length}>
            {pendientes.map((cita) => (
              <CitaCard
                key={cita.id}
                cita={cita}
                svc={serviceFor(cita.id_servicio_nosql)}
                onClick={() => openDetail(cita)}
              />
            ))}
          </Section>
        </div>
      ) : (
        <div className="space-y-3">
          {historial.map((cita) => (
            <CitaCard
              key={cita.id}
              cita={cita}
              svc={serviceFor(cita.id_servicio_nosql)}
              onClick={() => openDetail(cita)}
            />
          ))}
        </div>
      )}

      {/* ── Modal de detalle ── */}
      {selected && user && (
        <DetailModal
          cita={selected}
          svc={selectedSvc}
          myReview={selectedRev}
          userId={user.id}
          userName={`${user.nombre} ${user.apellido ?? ""}`.trim()}
          onClose={handleClose}
          onPay={() => {}}
          onReview={() => {}}
          paying={paying}
          payError={payError}
          reviewing={reviewing}
          revError={revError}
          metodo={metodo}
          setMetodo={setMetodo}
          monto={monto}
          setMonto={setMonto}
          precio={selectedPrecio}
          rating={rating}
          setRating={setRating}
          comentario={comentario}
          setComentario={setComentario}
          handlePay={handlePay}
          handleReview={handleReview}
          setCitas={setCitas}
        />
      )}
    </div>
  );
}
