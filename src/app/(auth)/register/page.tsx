"use client";

import Link from "next/link";
import { useState, useActionState } from "react";
import { Building2, User, Check } from "lucide-react";
import AioniosLogo from "@/components/ui/AioniosLogo";
import ErrorBanner from "@/components/ui/ErrorBanner";
import PasswordInput from "@/components/ui/PasswordInput";
import SubmitButton from "@/components/ui/SubmitButton";
import { authService } from "@/services/auth.service";

type Role = "business" | "client";
type FormState = { error: string } | null;

// id_rol: 2 = administrador de negocio, 3 = cliente — ajustar si los IDs del backend difieren
const ROLE_ID: Record<Role, number> = { business: 2, client: 3 };

async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const nombre   = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const email    = formData.get("email") as string;
  const password = formData.get("password") as string;
  const telefono = formData.get("telefono") as string;
  const id_rol   = Number(formData.get("id_rol"));
  const role     = (formData.get("role") as Role) ?? "business";

  if (!nombre || !apellido || !email || !password || !telefono) {
    return { error: "Por favor completa todos los campos." };
  }

  try {
    await authService.register({ nombre, apellido, email, password, telefono, id_rol });
    window.location.href = role === "business" ? "/dashboard" : "/portal";
    return null;
  } catch {
    return { error: "No se pudo crear la cuenta. El correo ya puede estar registrado." };
  }
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
              const scheme = r === "business"
                ? { border: "border-indigo-600", bg: "bg-indigo-50", icon: "bg-indigo-600 text-white", label: "text-indigo-700" }
                : { border: "border-violet-600", bg: "bg-violet-50", icon: "bg-violet-600 text-white", label: "text-violet-700" };
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
            <input type="hidden" name="id_rol" value={ROLE_ID[role]} />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">Nombre</label>
                <input id="nombre" name="nombre" type="text" placeholder="Juan"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="apellido" className="block text-sm font-medium text-slate-700">Apellido</label>
                <input id="apellido" name="apellido" type="text" placeholder="Garcia"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="telefono" className="block text-sm font-medium text-slate-700">Telefono</label>
              <input id="telefono" name="telefono" type="tel" placeholder="1234567890"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" />
            </div>

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
