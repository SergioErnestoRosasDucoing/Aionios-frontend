"use client";

import Link from "next/link";
import { useState, useActionState } from "react";
import { Building2, User } from "lucide-react";
import AioniosLogo from "@/components/ui/AioniosLogo";
import ErrorBanner from "@/components/ui/ErrorBanner";
import PasswordInput from "@/components/ui/PasswordInput";
import SubmitButton from "@/components/ui/SubmitButton";

type Role = "business" | "client";
type FormState = { error: string } | null;

// Defined at module level → stable reference, no stale closure.
// Role is read from the hidden form field, not from component state.
async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as Role) ?? "business";

  if (!email || !password) return { error: "Por favor completa todos los campos." };

  await new Promise((r) => setTimeout(r, 1200));
  window.location.href = role === "business" ? "/dashboard" : "/portal";
  return null;
}

const demoNote: Record<Role, string> = {
  business: "Ingresa cualquier correo y contrasena para acceder al panel de negocio.",
  client:   "Ingresa cualquier correo y contrasena para explorar el portal de cliente.",
};

export default function LoginPage() {
  const [role, setRole] = useState<Role>("business");
  const [state, action, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <AioniosLogo size="lg" />
        </div>

        <div className="relative space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Conecta negocios{" "}
              <span className="text-indigo-400">con personas</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              La plataforma que une a negocios de cualquier rubro con clientes que buscan sus servicios.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Building2, color: "bg-indigo-600/30 text-indigo-400", title: "Para negocios", desc: "Gestiona citas, servicios, pagos y clientes desde un solo panel." },
              { icon: User,      color: "bg-violet-600/30 text-violet-400", title: "Para clientes", desc: "Descubre negocios, agenda servicios y gestiona tus citas en segundos." },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-white text-sm font-semibold mb-1">{title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { label: "Negocios activos", value: "2,400+" },
              { label: "Citas gestionadas", value: "180K" },
              { label: "Satisfaccion",      value: "98%" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-slate-400 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-600 text-sm">2026 Aionios. Todos los derechos reservados.</p>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-2 lg:hidden">
            <AioniosLogo size="md" textColor="text-slate-900" />
          </div>

          <div className="mb-6 mt-8 lg:mt-0">
            <h2 className="text-2xl font-bold text-slate-900">Bienvenido de nuevo</h2>
            <p className="text-slate-500 mt-1">Selecciona tu tipo de cuenta para continuar</p>
          </div>

          {/* Selector de rol */}
          <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-slate-100 rounded-2xl">
            {(["business", "client"] as const).map((r) => {
              const Icon = r === "business" ? Building2 : User;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    role === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {r === "business" ? "Negocio" : "Cliente"}
                </button>
              );
            })}
          </div>

          <div className={`rounded-xl border p-3 mb-5 text-xs ${
            role === "business"
              ? "bg-indigo-50 border-indigo-100 text-indigo-700"
              : "bg-violet-50 border-violet-100 text-violet-700"
          }`}>
            <span className="font-semibold">Modo demo — </span>
            {demoNote[role]}
          </div>

          {state?.error && <div className="mb-4"><ErrorBanner message={state.error} /></div>}

          <form action={action} className="space-y-4">
            {/* Hidden field so the stable action can read the current role */}
            <input type="hidden" name="role" value={role} />

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Correo electronico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Contrasena
                </label>
                <button type="button" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                  Olvidaste tu contrasena?
                </button>
              </div>
              <PasswordInput id="password" name="password" />
            </div>

            <SubmitButton
              loading={isPending}
              loadingText="Iniciando sesion..."
              colorScheme={role === "business" ? "indigo" : "violet"}
            >
              {`Entrar como ${role === "business" ? "negocio" : "cliente"}`}
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            No tienes cuenta?{" "}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Registrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
