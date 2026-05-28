"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, User } from "lucide-react";
import AioniosLogo from "@/components/ui/AioniosLogo";
import PasswordInput from "@/components/ui/PasswordInput";
import SubmitButton from "@/components/ui/SubmitButton";
import { authService } from "@/services/auth.service";
import { ROLES } from "@/types/auth.types";
import axios from "axios";

interface Fields { nombre: string; apellido: string; telefono: string; email: string; password: string }
interface FieldErrors { nombre?: string; apellido?: string; telefono?: string; email?: string; password?: string; general?: string }

const FEATURES = [
  "Descubre negocios cerca de ti",
  "Reserva citas en segundos",
  "Historial de todos tus servicios",
  "Valora y comenta tu experiencia",
];

export default function RegisterPage() {
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
      await authService.register({ ...fields, nombre: fields.nombre.trim(), apellido: fields.apellido.trim(), id_rol: ROLES.CLIENT });
      window.location.href = "/portal";
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
        : "border-slate-200 focus:ring-violet-500"
    }`;

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-20 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <AioniosLogo size="lg" />
        </div>

        <div className="relative space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Encuentra el servicio<br />
              <span className="text-violet-400">que necesitas hoy</span>
            </h1>
            <p className="text-slate-400 text-lg">Miles de negocios verificados listos para atenderte.</p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 bg-violet-600/20 border-violet-500/30">
                  <Check className="w-3 h-3 text-violet-400" strokeWidth={2.5} />
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
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <User className="w-3.5 h-3.5" />
              Cuenta de cliente
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Crea tu cuenta</h2>
            <p className="text-slate-500 mt-1">Comienza a descubrir y reservar servicios</p>
          </div>

          {errors.general && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">Nombre</label>
                <input id="nombre" type="text" placeholder="Juan" value={fields.nombre} onChange={set("nombre")}
                  className={inputClass("nombre")} />
                {errors.nombre && <p className="text-xs text-rose-600">{errors.nombre}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="apellido" className="block text-sm font-medium text-slate-700">Apellido</label>
                <input id="apellido" type="text" placeholder="García" value={fields.apellido} onChange={set("apellido")}
                  className={inputClass("apellido")} />
                {errors.apellido && <p className="text-xs text-rose-600">{errors.apellido}</p>}
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
                className={inputClass("telefono")}
              />
              {errors.telefono
                ? <p className="text-xs text-rose-600">{errors.telefono}</p>
                : <p className="text-xs text-slate-400">10 dígitos sin espacios ni guiones</p>
              }
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Correo electrónico</label>
              <input id="email" type="email" placeholder="tu@correo.com" value={fields.email} onChange={set("email")}
                className={inputClass("email")} />
              {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <PasswordInput
                id="password" name="password" label="Contraseña" placeholder="Mínimo 8 caracteres"
                value={fields.password}
                onChange={(e) => { setFields((p) => ({ ...p, password: e.target.value })); setErrors((p) => ({ ...p, password: undefined })); }}
                error={errors.password}
              />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Al registrarte, aceptas nuestros{" "}
              <span className="text-violet-600 cursor-pointer hover:underline">Términos de servicio</span>{" "}
              y{" "}
              <span className="text-violet-600 cursor-pointer hover:underline">Política de privacidad</span>.
            </p>

            <SubmitButton loading={isPending} loadingText="Creando cuenta..." colorScheme="violet">
              Crear cuenta de cliente
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-violet-600 hover:text-violet-700 font-semibold">
              Inicia sesión
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-xs text-slate-400 mb-3">¿Quieres registrar tu negocio?</p>
            <Link
              href="/business/register"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Registrar negocio en Aionios
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
