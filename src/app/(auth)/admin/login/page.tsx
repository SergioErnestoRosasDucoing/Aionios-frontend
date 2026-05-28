"use client";

import { useState, useActionState } from "react";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import AioniosLogo from "@/components/ui/AioniosLogo";
import ErrorBanner from "@/components/ui/ErrorBanner";
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

    if (user.id_rol !== ROLES.SUPERADMIN) {
      return { error: "Acceso denegado. Esta área es exclusiva para administradores." };
    }

    window.location.href = "/dashboard/support";
    return null;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (!err.response) return { error: "No se pudo conectar con el servidor." };
      if (err.response.status === 401) return { error: "Credenciales incorrectas." };
      return { error: `Error del servidor (${err.response.status}).` };
    }
    return { error: "Error inesperado. Intenta de nuevo." };
  }
}

export default function AdminLoginPage() {
  const [state, action, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <AioniosLogo size="md" />
          <div className="mt-6 flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-full">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300 text-sm font-medium">Panel de administración</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-1">Acceso restringido</h2>
          <p className="text-slate-400 text-sm mb-6">Solo para superadministradores de Aionios</p>

          {state?.error && <div className="mb-4"><ErrorBanner message={state.error} /></div>}

          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-400">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@aionios.com"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-400">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <SubmitButton loading={isPending} loadingText="Verificando..." colorScheme="indigo">
              Acceder
            </SubmitButton>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          2026 Aionios — Uso interno exclusivo
        </p>
      </div>
    </div>
  );
}
