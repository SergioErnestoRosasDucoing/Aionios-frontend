"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Check, Building2 } from "lucide-react";
import AioniosLogo from "@/components/ui/AioniosLogo";
import ErrorBanner from "@/components/ui/ErrorBanner";
import PasswordInput from "@/components/ui/PasswordInput";
import SubmitButton from "@/components/ui/SubmitButton";
import { authService } from "@/services/auth.service";
import { ROLES } from "@/types/auth.types";

type FormState = { error: string } | null;

async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const nombre   = formData.get("nombre")   as string;
  const apellido = formData.get("apellido") as string;
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;
  const telefono = formData.get("telefono") as string;

  if (!nombre || !apellido || !email || !password || !telefono) {
    return { error: "Por favor completa todos los campos." };
  }

  try {
    await authService.register({ nombre, apellido, email, password, telefono, id_rol: ROLES.BUSINESS_OWNER });
    window.location.href = "/dashboard";
    return null;
  } catch {
    return { error: "No se pudo crear la cuenta. El correo ya puede estar registrado." };
  }
}

const FEATURES = [
  "Panel de control con métricas en tiempo real",
  "Gestión de citas y horarios automatizada",
  "Catálogo de servicios personalizable",
  "Historial de pagos y reportes",
  "Agrega colaboradores a tu equipo",
];

export default function BusinessRegisterPage() {
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
            <h1 className="text-4xl font-bold text-white leading-tight">
              Lleva tu negocio<br />
              <span className="text-indigo-400">al siguiente nivel</span>
            </h1>
            <p className="text-slate-400 text-lg">Gestiona todo desde un solo lugar. Gratis para empezar.</p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 bg-indigo-600/20 border-indigo-500/30">
                  <Check className="w-3 h-3 text-indigo-400" strokeWidth={2.5} />
                </div>
                <span className="text-slate-300 text-sm">{f}</span>
              </li>
            ))}
          </ul>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-slate-400 text-xs mb-2 font-semibold uppercase tracking-wider">Nota</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              Esta cuenta es para el <strong className="text-white">dueño del negocio</strong>.
              Los colaboradores son invitados directamente desde el panel de administración.
            </p>
          </div>
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
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Building2 className="w-3.5 h-3.5" />
              Cuenta de negocio
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Registra tu negocio</h2>
            <p className="text-slate-500 mt-1">Crea tu cuenta como dueño y empieza a gestionar</p>
          </div>

          {state?.error && <div className="mb-4"><ErrorBanner message={state.error} /></div>}

          <form action={action} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">Nombre</label>
                <input id="nombre" name="nombre" type="text" placeholder="Juan"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="apellido" className="block text-sm font-medium text-slate-700">Apellido</label>
                <input id="apellido" name="apellido" type="text" placeholder="García"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="telefono" className="block text-sm font-medium text-slate-700">Teléfono</label>
              <input id="telefono" name="telefono" type="tel" placeholder="1234567890"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Correo electrónico</label>
              <input id="email" name="email" type="email" placeholder="tu@negocio.com"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" />
            </div>

            <PasswordInput id="password" name="password" label="Contraseña" placeholder="Mínimo 8 caracteres" />

            <p className="text-xs text-slate-400 leading-relaxed">
              Al registrarte, aceptas nuestros{" "}
              <span className="text-indigo-600 cursor-pointer hover:underline">Términos de servicio</span>{" "}
              y{" "}
              <span className="text-indigo-600 cursor-pointer hover:underline">Política de privacidad</span>.
            </p>

            <SubmitButton loading={isPending} loadingText="Creando cuenta..." colorScheme="indigo">
              Crear cuenta de negocio
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/business/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Inicia sesión
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-xs text-slate-400 mb-3">¿Eres cliente?</p>
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Crear cuenta de cliente
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
