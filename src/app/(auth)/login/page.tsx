"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Compass, CalendarDays, Star, User } from "lucide-react";
import AioniosLogo from "@/components/ui/AioniosLogo";
import ErrorBanner from "@/components/ui/ErrorBanner";
import PasswordInput from "@/components/ui/PasswordInput";
import SubmitButton from "@/components/ui/SubmitButton";
import axios from "axios";
import { authService } from "@/services/auth.service";
import { ROLES } from "@/types/auth.types";

type FormState = { error: string } | null;

async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Por favor completa todos los campos." };

  try {
    const { user } = await authService.login({ email, password });

    if (user.id_rol !== ROLES.CLIENT) {
      return { error: "Esta cuenta es de negocio. Usa el portal de negocios para iniciar sesión." };
    }

    window.location.href = "/portal";
    return null;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (!err.response) return { error: "No se pudo conectar con el servidor. Verifica tu conexión." };
      if (err.response.status === 401) return { error: "Correo o contraseña incorrectos." };
      return { error: `Error del servidor (${err.response.status}). Intenta de nuevo.` };
    }
    return { error: "Error inesperado. Intenta de nuevo." };
  }
}

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <AioniosLogo size="lg" />
        </div>

        <div className="relative space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Encuentra servicios{" "}
              <span className="text-violet-400">cerca de ti</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Miles de negocios verificados listos para atenderte. Agenda citas en segundos.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Compass,      color: "bg-violet-600/30 text-violet-400", title: "Explora",   desc: "Descubre negocios cerca de ti" },
              { icon: CalendarDays, color: "bg-indigo-600/30 text-indigo-400", title: "Agenda",    desc: "Reserva citas fácilmente" },
              { icon: Star,         color: "bg-amber-600/30  text-amber-400",  title: "Comenta",   desc: "Valora tu experiencia" },
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
              { label: "Negocios activos",  value: "2,400+" },
              { label: "Citas gestionadas", value: "180K"   },
              { label: "Satisfacción",      value: "98%"    },
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

          <div className="mb-2 lg:mt-0 mt-8">
            <div className="flex items-center gap-3 bg-violet-600 text-white px-4 py-3 rounded-2xl mb-5 shadow-sm shadow-violet-200">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Portal de clientes</p>
                <p className="text-violet-200 text-xs leading-tight">Reserva citas y explora negocios</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">¡Bienvenido!</h2>
            <p className="text-slate-500 mt-1">Inicia sesión para gestionar tus citas y explorar negocios</p>
          </div>

          {state?.error && <div className="mb-4 mt-4"><ErrorBanner message={state.error} /></div>}

          <form action={action} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <PasswordInput id="password" name="password" />
            </div>

            <SubmitButton loading={isPending} loadingText="Iniciando sesión..." colorScheme="violet">
              Iniciar sesión
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-violet-600 hover:text-violet-700 font-semibold">
              Regístrate gratis
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-xs text-slate-400 mb-3">¿Eres un negocio?</p>
            <Link
              href="/business/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all"
            >
              Acceder al portal de negocios
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
