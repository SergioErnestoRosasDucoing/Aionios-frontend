"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Building2 } from "lucide-react";
import AioniosLogo from "@/components/ui/AioniosLogo";
import PasswordInput from "@/components/ui/PasswordInput";
import SubmitButton from "@/components/ui/SubmitButton";
import { authService } from "@/services/auth.service";
import { ROLES } from "@/types/auth.types";
import axios from "axios";

interface Fields { nombre: string; apellido: string; telefono: string; email: string; password: string }
interface FieldErrors { nombre?: string; apellido?: string; telefono?: string; email?: string; password?: string; general?: string }

const FEATURES = [
  "Panel de control con métricas en tiempo real",
  "Gestión de citas y horarios automatizada",
  "Catálogo de servicios personalizable",
  "Historial de pagos y reportes",
  "Agrega colaboradores a tu equipo",
];

export default function BusinessRegisterPage() {
  const [fields, setFields] = useState<Fields>({ nombre: "", apellido: "", telefono: "", email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isPending, setIsPending] = useState(false);

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!fields.nombre.trim())   e.nombre   = "El nombre es obligatorio.";
    if (!fields.apellido.trim()) e.apellido  = "El apellido es obligatorio.";
    if (!/^\d{10}$/.test(fields.telefono)) e.telefono = "El teléfono debe tener exactamente 10 dígitos.";
    if (!fields.email.trim())    e.email    = "El correo electrónico es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = "Ingresa un correo válido.";
    if (!fields.password)        e.password = "La contraseña es obligatoria.";
    else if (fields.password.length < 8) e.password = "La contraseña debe tener al menos 8 caracteres.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }

    setIsPending(true);
    setErrors({});
    try {
      await authService.register({ ...fields, nombre: fields.nombre.trim(), apellido: fields.apellido.trim(), id_rol: ROLES.BUSINESS_OWNER });
      window.location.href = "/dashboard";
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setErrors({ general: "No se pudo conectar con el servidor. Verifica tu conexión." });
        } else if (err.response.status === 409 || err.response.data?.message?.includes("already")) {
          setErrors({ email: "Este correo ya está registrado. Intenta con otro." });
        } else if (err.response.status === 400) {
          setErrors({ general: "Datos inválidos. Revisa la información ingresada." });
        } else {
          setErrors({ general: `Error del servidor (${err.response.status}). Intenta de nuevo.` });
        }
      } else {
        setErrors({ general: "Error inesperado. Intenta de nuevo." });
      }
      setIsPending(false);
    }
  };

  const inputClass = (field: keyof FieldErrors) =>
    `w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm ${
      errors[field]
        ? "border-rose-400 focus:ring-rose-400"
        : "border-slate-200 focus:ring-amber-500"
    }`;

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
              <span className="text-amber-400">al siguiente nivel</span>
            </h1>
            <p className="text-slate-400 text-lg">Gestiona todo desde un solo lugar. Gratis para empezar.</p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 bg-amber-600/20 border-amber-500/30">
                  <Check className="w-3 h-3 text-amber-400" strokeWidth={2.5} />
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
            <div className="flex items-center gap-3 bg-amber-500 text-white px-4 py-3 rounded-2xl mb-5 shadow-sm shadow-amber-200">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Portal de negocios</p>
                <p className="text-amber-100 text-xs leading-tight">Gestiona tu negocio y citas</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Registra tu negocio</h2>
            <p className="text-slate-500 mt-1">Crea tu cuenta como dueño y empieza a gestionar</p>
          </div>

          {errors.general && (
            <div aria-live="assertive" role="alert" className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">Nombre</label>
                <input id="nombre" type="text" placeholder="Juan" value={fields.nombre} onChange={set("nombre")}
                  aria-describedby={errors.nombre ? "nombre-error" : undefined}
                  aria-invalid={!!errors.nombre}
                  className={inputClass("nombre")} />
                {errors.nombre && <p id="nombre-error" role="alert" className="text-xs text-rose-600">{errors.nombre}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="apellido" className="block text-sm font-medium text-slate-700">Apellido</label>
                <input id="apellido" type="text" placeholder="García" value={fields.apellido} onChange={set("apellido")}
                  aria-describedby={errors.apellido ? "apellido-error" : undefined}
                  aria-invalid={!!errors.apellido}
                  className={inputClass("apellido")} />
                {errors.apellido && <p id="apellido-error" role="alert" className="text-xs text-rose-600">{errors.apellido}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="telefono" className="block text-sm font-medium text-slate-700">Teléfono</label>
              <input
                id="telefono" type="tel" placeholder="1234567890" value={fields.telefono}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFields((prev) => ({ ...prev, telefono: val }));
                  setErrors((prev) => ({ ...prev, telefono: undefined }));
                }}
                aria-describedby={errors.telefono ? "telefono-error" : "telefono-hint"}
                aria-invalid={!!errors.telefono}
                className={inputClass("telefono")}
              />
              {errors.telefono
                ? <p id="telefono-error" role="alert" className="text-xs text-rose-600">{errors.telefono}</p>
                : <p id="telefono-hint" className="text-xs text-slate-400">10 dígitos sin espacios ni guiones</p>
              }
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Correo electrónico</label>
              <input id="email" type="email" placeholder="tu@negocio.com" value={fields.email} onChange={set("email")}
                aria-describedby={errors.email ? "email-error" : undefined}
                aria-invalid={!!errors.email}
                className={inputClass("email")} />
              {errors.email && <p id="email-error" role="alert" className="text-xs text-rose-600">{errors.email}</p>}
            </div>

            <PasswordInput
              id="password" name="password" label="Contraseña" placeholder="Mínimo 8 caracteres"
              value={fields.password}
              onChange={(e) => { setFields((p) => ({ ...p, password: e.target.value })); setErrors((p) => ({ ...p, password: undefined })); }}
              error={errors.password}
            />

            <p className="text-xs text-slate-400 leading-relaxed">
              Al registrarte, aceptas nuestros{" "}
              <span className="text-amber-600 cursor-pointer hover:underline">Términos de servicio</span>{" "}
              y{" "}
              <span className="text-amber-600 cursor-pointer hover:underline">Política de privacidad</span>.
            </p>

            <SubmitButton loading={isPending} loadingText="Creando cuenta..." colorScheme="amber">
              Crear cuenta de negocio
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/business/login" className="text-amber-600 hover:text-amber-700 font-semibold">
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
