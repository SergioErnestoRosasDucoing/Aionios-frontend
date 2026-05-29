"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays, Plus, Clock, CheckCircle, XCircle,
  MapPin, ChevronRight, Loader2, CreditCard, X,
  DollarSign, Banknote, Smartphone, Star, MessageSquare,
  CalendarClock,
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
  { value: "efectivo",      label: "Efectivo",     icon: Banknote   },
  { value: "tarjeta",       label: "Tarjeta",      icon: CreditCard },
  { value: "transferencia", label: "Transferencia",icon: Smartphone },
] as const;

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

/** Considera "upcoming" por fecha, ignorando la hora (útil para 00:00) */
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

interface PayModal  { cita: SolicitudCliente; precio: number; }
interface RevModal  { cita: SolicitudCliente; }
interface ChatModal { cita: SolicitudCliente; }

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

// ── Tarjeta de cita ───────────────────────────────────────────────────────────
function CitaCard({
  cita, svc, myReview,
  onPay, onReview, onChat,
}: {
  cita: SolicitudCliente;
  svc: Service | undefined;
  myReview: Review | undefined;
  onPay: () => void;
  onReview: () => void;
  onChat: () => void;
}) {
  const cfg      = ESTADO_CONFIG[cita.estado];
  const Icon     = cfg.icon;
  const paid     = isPaid(cita);
  const convenir = isAConvenir(svc);
  const isPast   = !isUpcomingDate(cita.fecha_hora_propuesta) && !convenir;
  const canReview = isPast && cita.estado === "CONFIRMADA" && !myReview;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
      {/* Bloque de fecha — oculto para "a convenir" */}
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
          {/* Solo mostrar fecha/hora para citas normales */}
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

      {/* Acciones */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded-full ${cfg.cls}`}>
          <Icon className="w-3 h-3" />
          {cfg.label}
        </span>

        {/* Chat "a convenir" */}
        {convenir && cita.estado !== "CANCELADA" && (
          <button onClick={onChat}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3 h-3" />
            Coordinar
          </button>
        )}

        {/* Pagar */}
        {cita.estado === "CONFIRMADA" && !isPast && !paid && (
          <button onClick={onPay}
            className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <DollarSign className="w-3 h-3" />
            Pagar
          </button>
        )}

        {paid && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Pagado
          </span>
        )}

        {canReview && (
          <button onClick={onReview}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Star className="w-3 h-3" />
            Reseñar
          </button>
        )}

        {myReview && isPast && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600">
            {"★".repeat(myReview.rating)} Tu reseña
          </span>
        )}

        <Link href={`/portal/negocio/${cita.negocio.slug}`}
          className="inline-flex items-center gap-0.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Ver negocio <ChevronRight className="w-3 h-3" />
        </Link>
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

  const [payModal,   setPayModal]   = useState<PayModal | null>(null);
  const [metodo,     setMetodo]     = useState("efectivo");
  const [monto,      setMonto]      = useState("");
  const [paying,     setPaying]     = useState(false);
  const [payError,   setPayError]   = useState<string | null>(null);

  const [revModal,   setRevModal]   = useState<RevModal | null>(null);
  const [chatModal,  setChatModal]  = useState<ChatModal | null>(null);
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
  // "a convenir": vive en "próximas" mientras no esté cancelada (ignora la hora 00:00)
  // Regular: "próximas" = fecha futura + no cancelada
  const isProxima = (c: SolicitudCliente) => {
    const svc = serviceFor(c.id_servicio_nosql);
    if (isAConvenir(svc)) return c.estado !== "CANCELADA";
    return isUpcomingDate(c.fecha_hora_propuesta) && c.estado !== "CANCELADA";
  };

  const proximas  = citas.filter(isProxima);
  const historial = citas.filter((c) => !isProxima(c));

  // Sub-grupos dentro de "Próximas"
  const confirmadas = proximas.filter((c) => c.estado === "CONFIRMADA");
  const pendientes  = proximas.filter((c) => c.estado === "PENDIENTE");

  const displayed  = tab === "proximas" ? proximas : historial;

  // ── Pago ──────────────────────────────────────────────────────────────────
  function openPay(cita: SolicitudCliente) {
    const precio = serviceFor(cita.id_servicio_nosql)?.precio ?? 0;
    setPayModal({ cita, precio });
    setMonto(precio > 0 ? String(precio) : "");
    setMetodo("efectivo");
    setPayError(null);
  }

  async function handlePay() {
    if (!payModal) return;
    const amount = parseFloat(monto);
    if (!monto || isNaN(amount) || amount <= 0) { setPayError("Ingresa un monto válido."); return; }
    setPaying(true); setPayError(null);
    try {
      const pago = await paymentsService.create({
        id_cita: payModal.cita.id, monto: amount, metodo_pago: metodo, estado_pago: "COMPLETADO",
      });
      setCitas((prev) => prev.map((c) =>
        c.id === payModal.cita.id
          ? { ...c, pagos: [...c.pagos, { id: pago.id, monto: pago.monto, metodo_pago: pago.metodo_pago, estado_pago: "COMPLETADO" }] }
          : c,
      ));
      setPayModal(null);
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message;
      setPayError(typeof msg === "string" ? msg : "No se pudo registrar el pago.");
    } finally { setPaying(false); }
  }

  // ── Reseña ────────────────────────────────────────────────────────────────
  function openReview(cita: SolicitudCliente) {
    setRevModal({ cita }); setRating(5); setComentario(""); setRevError(null);
  }

  async function handleReview() {
    if (!revModal || !user) return;
    if (rating < 1) { setRevError("Selecciona una calificación."); return; }
    setReviewing(true); setRevError(null);
    try {
      const rev = await reviewsService.create({
        negocio_id:    revModal.cita.id_negocio,
        usuario_id:    user.id,
        nombre_cliente:`${user.nombre}`,
        rating,
        comentario,
        fecha:         new Date().toISOString(),
      });
      setReviews((prev) => [...prev, rev]);
      setRevModal(null);
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message;
      setRevError(typeof msg === "string" ? msg : "No se pudo enviar la reseña.");
    } finally { setReviewing(false); }
  }

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
        /* ── Próximas: dos sub-secciones ── */
        <div className="space-y-6">
          <Section title="Confirmadas" count={confirmadas.length}>
            {confirmadas.map((cita) => (
              <CitaCard
                key={cita.id}
                cita={cita}
                svc={serviceFor(cita.id_servicio_nosql)}
                myReview={reviewFor(cita.id_negocio)}
                onPay={() => openPay(cita)}
                onReview={() => openReview(cita)}
                onChat={() => setChatModal({ cita })}
              />
            ))}
          </Section>

          <Section title="Pendientes de confirmación" count={pendientes.length}>
            {pendientes.map((cita) => (
              <CitaCard
                key={cita.id}
                cita={cita}
                svc={serviceFor(cita.id_servicio_nosql)}
                myReview={reviewFor(cita.id_negocio)}
                onPay={() => openPay(cita)}
                onReview={() => openReview(cita)}
                onChat={() => setChatModal({ cita })}
              />
            ))}
          </Section>
        </div>
      ) : (
        /* ── Historial: lista plana ── */
        <div className="space-y-3">
          {historial.map((cita) => (
            <CitaCard
              key={cita.id}
              cita={cita}
              svc={serviceFor(cita.id_servicio_nosql)}
              myReview={reviewFor(cita.id_negocio)}
              onPay={() => openPay(cita)}
              onReview={() => openReview(cita)}
              onChat={() => setChatModal({ cita })}
            />
          ))}
        </div>
      )}

      {/* ── Modal de pago ── */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Registrar pago</h2>
              <button onClick={() => setPayModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 space-y-1">
              <p className="text-sm font-semibold text-slate-800">{payModal.cita.negocio.nombre}</p>
              <p className="text-xs text-slate-500">
                {serviceFor(payModal.cita.id_servicio_nosql)?.nombre ?? "Servicio"}
                {!isAConvenir(serviceFor(payModal.cita.id_servicio_nosql)) && (
                  <> · {formatHora(payModal.cita.fecha_hora_propuesta)},{" "}
                  {new Date(payModal.cita.fecha_hora_propuesta).toLocaleDateString("es-MX", { day: "numeric", month: "long" })}</>
                )}
              </p>
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
                <input type="number" min="0" step="0.01" value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {payModal.precio > 0 && (
                <p className="text-xs text-slate-400">
                  Precio del servicio: <span className="font-medium text-slate-600">${payModal.precio.toLocaleString()}</span>
                </p>
              )}
            </div>

            {payError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">{payError}</div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setPayModal(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button onClick={handlePay} disabled={paying}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {paying ? "Guardando..." : "Confirmar pago"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de chat (a_convenir) ── */}
      {chatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900">Coordinar cita</h2>
                <p className="text-xs text-slate-500 mt-0.5">{chatModal.cita.negocio.nombre}</p>
              </div>
              <button onClick={() => setChatModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-5">
              <RequestChat
                solicitudId={chatModal.cita.id}
                autorId={user!.id}
                autorNombre={`${user!.nombre} ${user!.apellido ?? ""}`.trim()}
                autorTipo="cliente"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de reseña ── */}
      {revModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Dejar reseña</h2>
              <button onClick={() => setRevModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 space-y-1">
              <p className="text-sm font-semibold text-slate-800">{revModal.cita.negocio.nombre}</p>
              <p className="text-xs text-slate-500">
                {serviceFor(revModal.cita.id_servicio_nosql)?.nombre ?? "Servicio"}
              </p>
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

            <div className="flex gap-3">
              <button onClick={() => setRevModal(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button onClick={handleReview} disabled={reviewing || rating === 0}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {reviewing ? "Enviando..." : "Publicar reseña"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
