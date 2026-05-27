import type { JSX } from "react";
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  ArrowDownToLine,
  CheckCircle,
  XCircle,
  Clock,
  Search,
} from "lucide-react";

type PaymentStatus = "completed" | "pending" | "failed";

interface Payment {
  id: string;
  client: string;
  service: string;
  amount: number;
  date: string;
  method: string;
  status: PaymentStatus;
}

const payments: Payment[] = [
  { id: "PAY-1042", client: "Maria Lopez", service: "Corte y peinado", amount: 280, date: "26 may 2026", method: "Tarjeta", status: "completed" },
  { id: "PAY-1041", client: "Carlos Ramirez", service: "Tinte completo", amount: 850, date: "26 may 2026", method: "Efectivo", status: "completed" },
  { id: "PAY-1040", client: "Sofia Torres", service: "Manicure", amount: 180, date: "25 may 2026", method: "Transferencia", status: "completed" },
  { id: "PAY-1039", client: "Diego Morales", service: "Corte caballero", amount: 200, date: "25 may 2026", method: "Tarjeta", status: "pending" },
  { id: "PAY-1038", client: "Valeria Gutierrez", service: "Manicure y pedicure", amount: 380, date: "24 may 2026", method: "Tarjeta", status: "completed" },
  { id: "PAY-1037", client: "Marco Jimenez", service: "Tratamiento capilar", amount: 420, date: "24 may 2026", method: "Efectivo", status: "failed" },
  { id: "PAY-1036", client: "Laura Castillo", service: "Brushing", amount: 200, date: "23 may 2026", method: "Transferencia", status: "completed" },
  { id: "PAY-1035", client: "Roberto Diaz", service: "Corte y barba", amount: 280, date: "23 may 2026", method: "Tarjeta", status: "completed" },
];

const statusConfig: Record<PaymentStatus, { label: string; classes: string; icon: JSX.Element }> = {
  completed: {
    label: "Completado",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  pending: {
    label: "Pendiente",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock className="w-3 h-3" />,
  },
  failed: {
    label: "Fallido",
    classes: "bg-rose-50 text-rose-700 border-rose-200",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const methodColor: Record<string, string> = {
  Tarjeta: "bg-indigo-50 text-indigo-700",
  Efectivo: "bg-emerald-50 text-emerald-700",
  Transferencia: "bg-violet-50 text-violet-700",
};

const weekData = [
  { label: "L", amount: 680 },
  { label: "M", amount: 1050 },
  { label: "X", amount: 460 },
  { label: "J", amount: 940 },
  { label: "V", amount: 1200 },
  { label: "S", amount: 870 },
  { label: "D", amount: 0 },
];
const maxAmount = Math.max(...weekData.map((d) => d.amount));

export default function PaymentsPage() {
  const totalWeek = weekData.reduce((s, d) => s + d.amount, 0);

  // Single pass — avoids filtering 3x and guards against division by zero
  const completedPayments = payments.filter((p) => p.status === "completed");
  const completedTotal = completedPayments.reduce((s, p) => s + p.amount, 0);
  const completedCount = completedPayments.length;
  const avgPerVisit = completedCount > 0 ? Math.round(completedTotal / completedCount) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historial de pagos</h1>
          <p className="text-slate-500 text-sm mt-0.5">Resumen financiero y transacciones recientes</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer">
          <ArrowDownToLine className="w-4 h-4" />
          Exportar reporte
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Ingresos esta semana",
            value: `$${totalWeek.toLocaleString()}`,
            sub: "+12% vs semana anterior",
            icon: DollarSign,
            color: "bg-emerald-50 text-emerald-600",
            border: "border-emerald-100",
          },
          {
            label: "Transacciones completadas",
            value: `$${completedTotal.toLocaleString()}`,
            sub: `${completedCount} transacciones`,
            icon: CheckCircle,
            color: "bg-indigo-50 text-indigo-600",
            border: "border-indigo-100",
          },
          {
            label: "Promedio por visita",
            value: `$${avgPerVisit}`,
            sub: "Basado en visitas confirmadas",
            icon: TrendingUp,
            color: "bg-violet-50 text-violet-600",
            border: "border-violet-100",
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`bg-white rounded-2xl border ${kpi.border} p-5`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
              <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de transacciones */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Buscar transaccion..."
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {payments.map((pay) => {
              const s = statusConfig[pay.status];
              return (
                <div key={pay.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{pay.client}</p>
                    <p className="text-xs text-slate-500 truncate">{pay.service}</p>
                  </div>
                  <div className="hidden sm:block text-center">
                    <p className="text-xs text-slate-500">{pay.date}</p>
                    <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${methodColor[pay.method]}`}>
                      {pay.method}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 min-w-[60px] text-right">
                    ${pay.amount.toLocaleString()}
                  </p>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded-full flex-shrink-0 ${s.classes}`}>
                    {s.icon}
                    {s.label}
                  </span>
                  <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex-shrink-0 cursor-pointer">
                    Ver
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grafica semanal */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Ingresos por dia</h2>
          <p className="text-xs text-slate-500 mb-5">Esta semana</p>
          <div className="flex items-end gap-2 h-40 mb-3">
            {weekData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-lg bg-indigo-100 hover:bg-indigo-500 transition-colors"
                  style={{ height: maxAmount > 0 ? `${(d.amount / maxAmount) * 100}%` : "4px" }}
                />
                <span className="text-xs text-slate-400 font-medium">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Total semana</span>
              <span className="text-sm font-bold text-slate-900">${totalWeek.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
