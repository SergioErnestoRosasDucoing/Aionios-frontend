"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays, Plus, Clock, CheckCircle, XCircle,
  MapPin, ChevronRight, Loader2, CreditCard, X,
  DollarSign, Banknote, Smartphone,
} from "lucide-react";
import { requestsService } from "@/services/requests.service";
import { servicesService } from "@/services/services.service";
import { paymentsService } from "@/services/payments.service";
import type { SolicitudCliente } from "@/types/request.types";
import type { Service } from "@/types/service.types";

const ESTADO_CONFIG = {
  PENDIENTE:  { label: "Pendiente",  icon: Clock,        cls: "text-amber-700 bg-amber-50 border-amber-200"      },
  CONFIRMADA: { label: "Confirmada", icon: CheckCircle,  cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  CANCELADA:  { label: "Cancelada",  icon: XCircle,      cls: "text-rose-700 bg-rose-50 border-rose-200"          },
} as const;

const METODOS = [
  { value: "efectivo",      label: "Efectivo",       icon: Banknote    },
  { value: "tarjeta",       label: "Tarjeta",         icon: CreditCard  },
  { value: "transferencia", label: "Transferencia",   icon: Smartphone  },
] as const;

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function isUpcoming(iso: string) {
  return new Date(iso) >= new Date();
}

function isPaid(cita: SolicitudCliente) {
  return cita.pagos.some((p) => p.estado_pago === "COMPLETADO");
}

interface PayModal {
  cita: SolicitudCliente;
  precio: number;
}

export default function CitasPage() {
  const [citas, setCitas]       = useState<SolicitudCliente[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<"proximas" | "pasadas">("proximas");

  // Payment modal state
  const [payModal, setPayModal]   = useState<PayModal | null>(null);
  const [metodo, setMetodo]       = useState<string>("efectivo");
  const [monto, setMonto]         = useState<string>("");
  const [paying, setPaying]       = useState(false);
  const [payError, setPayError]   = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      requestsService.getMine(),
      servicesService.getAll(),
    ])
      .then(([reqs, svcs]) => { setCitas(reqs); setServices(svcs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const serviceFor = (mongoId: string) =>
    services.find((s) => s._id === mongoId);

  const proximas = citas.filter((c) => isUpcoming(c.fecha_hora_propuesta) && c.estado !== "CANCELADA");
  const pasadas  = citas.filter((c) => !isUpcoming(c.fecha_hora_propuesta) || c.estado === "CANCELADA");
  const displayed = tab === "proximas" ? proximas : pasadas;

  function openPay(cita: SolicitudCliente) {
    const svc = serviceFor(cita.id_servicio_nosql);
    const precio = svc?.precio ?? 0;
    setPayModal({ cita, precio });
    setMonto(precio > 0 ? String(precio) : "");
    setMetodo("efectivo");
    setPayError(null);
  }

  async function handlePay() {
    if (!payModal) return;
    const amount = parseFloat(monto);
    if (!monto || isNaN(amount) || amount <= 0) {
      setPayError("Ingresa un monto válido.");
      return;
    }
    setPaying(true);
    setPayError(null);
    try {
      const pago = await paymentsService.create({
        id_cita:     payModal.cita.id,
        monto:       amount,
        metodo_pago: metodo,
        estado_pago: "COMPLETADO",
      });
      // Update local state so button disappears immediately
      setCitas((prev) =>
        prev.map((c) =>
          c.id === payModal.cita.id
            ? { ...c, pagos: [...c.pagos, { id: pago.id, monto: pago.monto, metodo_pago: pago.metodo_pago, estado_pago: "COMPLETADO" }] }
            : c,
        ),
      );
      setPayModal(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setPayError(typeof msg === "string" ? msg : "No se pudo registrar el pago. Intenta de nuevo.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis citas</h1>
          <p className="text-slate-500 text-sm mt-0.5">Historial y próximas citas agendadas</p>
        </div>
        <Link
          href="/portal/explorar"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva cita
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["proximas", "pasadas"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "proximas" ? `Próximas (${proximas.length})` : `Pasadas (${pasadas.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
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
            <Link
              href="/portal/explorar"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Explorar negocios
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((cita) => {
            const cfg    = ESTADO_CONFIG[cita.estado];
            const Icon   = cfg.icon;
            const paid   = isPaid(cita);
            const svc    = serviceFor(cita.id_servicio_nosql);

            return (
              <div
                key={cita.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4"
              >
                {/* Date block */}
                <div className="text-center min-w-[52px] flex-shrink-0">
                  <p className="text-2xl font-bold text-indigo-600 leading-none">
                    {new Date(cita.fecha_hora_propuesta).getDate()}
                  </p>
                  <p className="text-xs text-slate-500 uppercase mt-0.5">
                    {new Date(cita.fecha_hora_propuesta).toLocaleDateString("es-MX", { month: "short" })}
                  </p>
                </div>

                <div className="w-px h-12 bg-slate-100 flex-shrink-0" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{cita.negocio.nombre}</p>
                  <p className="text-xs text-slate-500 truncate">{svc?.nombre ?? "Servicio"}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatHora(cita.fecha_hora_propuesta)} — {formatFecha(cita.fecha_hora_propuesta)}
                    </span>
                    {cita.negocio.direccion && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {cita.negocio.direccion}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded-full ${cfg.cls}`}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>

                  {cita.estado === "CONFIRMADA" && !paid && (
                    <button
                      onClick={() => openPay(cita)}
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

                  <Link
                    href={`/portal/negocio/${cita.id_negocio}`}
                    className="inline-flex items-center gap-0.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Ver negocio <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Registrar pago</h2>
              <button onClick={() => setPayModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cita summary */}
            <div className="bg-slate-50 rounded-xl p-3 space-y-1">
              <p className="text-sm font-semibold text-slate-800">{payModal.cita.negocio.nombre}</p>
              <p className="text-xs text-slate-500">
                {serviceFor(payModal.cita.id_servicio_nosql)?.nombre ?? "Servicio"} ·{" "}
                {formatHora(payModal.cita.fecha_hora_propuesta)},{" "}
                {new Date(payModal.cita.fecha_hora_propuesta).toLocaleDateString("es-MX", { day: "numeric", month: "long" })}
              </p>
            </div>

            {/* Método de pago */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">Método de pago</label>
              <div className="grid grid-cols-3 gap-2">
                {METODOS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setMetodo(value)}
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

            {/* Monto */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Monto a pagar</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={monto}
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
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
                {payError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setPayModal(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handlePay}
                disabled={paying}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {paying ? "Guardando..." : "Confirmar pago"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
