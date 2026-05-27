"use client";

import Link from "next/link";
import { useState, useActionState } from "react";
import { Building2, User, Check } from "lucide-react";
import AioniosLogo from "@/components/ui/AioniosLogo";
import ErrorBanner from "@/components/ui/ErrorBanner";
import PasswordInput from "@/components/ui/PasswordInput";
import SubmitButton from "@/components/ui/SubmitButton";

type Role = "business" | "client";
type FormState = { error: string } | null;

// Module-level stable action — reads role from hidden form field.
async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const name     = formData.get("name") as string;
  const email    = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role     = (formData.get("role") as Role) ?? "business";

  if (!name || !email || !password) return { error: "Por favor completa todos los campos." };
  if (role === "business" && !formData.get("business")) return { error: "Ingresa el nombre de tu negocio." };
  if (password.length < 8) return { error: "La contrasena debe tener al menos 8 caracteres." };

  await new Promise((r) => setTimeout(r, 1400));
  window.location.href = role === "business" ? "/dashboard" : "/portal";
  return null;
}

const FEATURES: Record<Role, string[]> = {
  business: [
    "Panel de control con metricas en tiempo real",
    "Gestion de citas y horarios",
    "Catalogo de servicios personalizable",
    "Historial de pagos y reportes",
  ],
  client: [
    "Descubre negocios cerca de ti",
    "Reserva citas en segundos",
    "Historial de todos tus servicios",
    "Valora y comenta tu experiencia",
  ],
};

const RUBROS = [
  "Salon de belleza", "Barberia", "Spa y masajes", "Construccion y remodelacion",
  "Tintoreria y lavanderia", "Clinica y salud", "Educacion y tutores",
  "Hogar y mantenimiento", "Tecnologia y reparacion", "Fotografia", "Otro",
];

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("business");
  const [state, action, isPending] = useActionState(registerAction, null);

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <AioniosLogo size="lg" />
        </div>

        <div className="relative space-y-8">
          <div className="space-y-3">
            {role === "business" ? (
              <>
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Lleva tu negocio<br />
                  <span className="text-indigo-400">al siguiente nivel</span>
                </h1>
                <p className="text-slate-400 text-lg">Gestiona todo desde un solo lugar. Gratis para empezar.</p>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Encuentra el servicio<br />
                  <span className="text-violet-400">que necesitas hoy</span>
                </h1>
                <p className="text-slate-400 text-lg">Miles de negocios verificados listos para atenderte.</p>
              </>
            )}
          </div>

          <ul className="space-y-3">
            {FEATURES[role].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                  role === "business"
                    ? "bg-indigo-600/20 border-indigo-500/30"
                    : "bg-violet-600/20 border-violet-500/30"
                }`}>
                  <Check
                    className={`w-3 h-3 ${role === "business" ? "text-indigo-400" : "text-violet-400"}`}
                    strokeWidth={2.5}
                  />
                </div>
                <span className="text-slate-300 text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-slate-500 text-sm">2026 Aionios. Todos los derechos reservados.</p>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="mb-2 lg:hidden">
            <AioniosLogo size="md" textColor="text-slate-900" />
          </div>

          <div className="mb-6 mt-8 lg:mt-0">
            <h2 className="text-2xl font-bold text-slate-900">Crea tu cuenta</h2>
            <p className="text-slate-500 mt-1">Elige como quieres usar Aionios</p>
          </div>

          {/* Selector de rol */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(["business", "client"] as const).map((r) => {
              const Icon = r === "business" ? Building2 : User;
              const active = role === r;
              const scheme = r === "business" ? { border: "border-indigo-600", bg: "bg-indigo-50", icon: "bg-indigo-600 text-white", label: "text-indigo-700" } : { border: "border-violet-600", bg: "bg-violet-50", icon: "bg-violet-600 text-white", label: "text-violet-700" };
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    active ? `${scheme.border} ${scheme.bg}` : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? scheme.icon : "bg-slate-100 text-slate-500"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${active ? scheme.label : "text-slate-700"}`}>
                      {r === "business" ? "Soy un negocio" : "Soy un cliente"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {r === "business" ? "Ofrezco servicios" : "Busco servicios"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {state?.error && <div className="mb-4"><ErrorBanner message={state.error} /></div>}

          <form action={action} className="space-y-4">
            <input type="hidden" name="role" value={role} />

            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre completo</label>
              <input id="name" name="name" type="text" placeholder="Juan Garcia"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" />
            </div>

            {role === "business" && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="business" className="block text-sm font-medium text-slate-700">Nombre del negocio</label>
                  <input id="business" name="business" type="text" placeholder="Mi Negocio SA"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="rubro" className="block text-sm font-medium text-slate-700">Rubro</label>
                  <select id="rubro" name="rubro"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm cursor-pointer">
                    {RUBROS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Correo electronico</label>
              <input id="email" name="email" type="email" placeholder="tu@correo.com"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" />
            </div>

            <PasswordInput id="password" name="password" label="Contrasena" placeholder="Minimo 8 caracteres" />

            <p className="text-xs text-slate-400 leading-relaxed">
              Al registrarte, aceptas nuestros{" "}
              <span className="text-indigo-600 cursor-pointer hover:underline">Terminos de servicio</span>{" "}
              y{" "}
              <span className="text-indigo-600 cursor-pointer hover:underline">Politica de privacidad</span>.
            </p>

            <SubmitButton
              loading={isPending}
              loadingText="Creando cuenta..."
              colorScheme={role === "business" ? "indigo" : "violet"}
            >
              {`Crear cuenta ${role === "business" ? "de negocio" : "de cliente"}`}
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Ya tienes cuenta?{" "}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
