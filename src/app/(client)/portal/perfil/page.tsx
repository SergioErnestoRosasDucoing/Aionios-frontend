"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Bell, Shield, ChevronRight, Star, CalendarDays, LogOut, X, Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/axios";
import { requestsService } from "@/services/requests.service";
import { reviewsService } from "@/services/reviews.service";

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [citasCount,  setCitasCount]  = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number | null>(null);

  const [showEdit, setShowEdit]   = useState(false);
  const [nombre,   setNombre]     = useState(user?.nombre   ?? "");
  const [apellido, setApellido]   = useState(user?.apellido ?? "");
  const [telefono, setTelefono]   = useState(user?.telefono ?? "");
  const [saving,   setSaving]     = useState(false);
  const [saveError,setSaveError]  = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      requestsService.getMine().catch(() => []),
      reviewsService.getMine().catch(() => []),
    ]).then(([citas, revs]) => {
      setCitasCount(citas.length);
      setReviewCount(revs.length);
    });
  }, []);

  const handleLogout = () => { logout(); router.push("/login"); };

  const openEdit = () => {
    setNombre(user?.nombre   ?? "");
    setApellido(user?.apellido ?? "");
    setTelefono(user?.telefono ?? "");
    setSaveError(null);
    setShowEdit(true);
  };

  const handleSave = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      setSaveError("Nombre y apellido son obligatorios.");
      return;
    }
    setSaving(true); setSaveError(null);
    try {
      await apiClient.patch("/users/me", { nombre: nombre.trim(), apellido: apellido.trim(), telefono: telefono.trim() });
      // Update localStorage so AuthContext reflects the change on next load
      const stored = localStorage.getItem("aionios_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem("aionios_user", JSON.stringify({ ...parsed, nombre: nombre.trim(), apellido: apellido.trim(), telefono: telefono.trim() }));
      }
      setShowEdit(false);
      // Soft reload to refresh user context
      router.refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setSaveError(typeof msg === "string" ? msg : "No se pudo guardar. Intenta de nuevo.");
    } finally { setSaving(false); }
  };

  const fullName  = user ? `${user.nombre} ${user.apellido}` : "Usuario";
  const initial   = user?.nombre?.charAt(0).toUpperCase() ?? "U";
  const joinMonth = new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  const stats = [
    { label: "Citas totales",  value: citasCount  ?? "—", icon: CalendarDays },
    { label: "Reseñas dadas",  value: reviewCount ?? "—", icon: Star         },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Cabecera */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-slate-900">{fullName}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">Miembro desde {joinMonth}</p>
          </div>
          <button
            onClick={openEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon className="w-4 h-4 text-indigo-500" />
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </div>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Datos de contacto */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 mb-1">Informacion de contacto</h2>
        {[
          { icon: Mail,  value: user?.email    ?? "—" },
          { icon: Phone, value: user?.telefono ?? "Sin teléfono" },
        ].map(({ icon: Icon, value }) => (
          <div key={value} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-sm text-slate-700">{value}</span>
          </div>
        ))}
      </div>

      {/* Secciones del menu */}
      {[
        {
          title: "Cuenta",
          items: [
            { icon: Shield, label: "Seguridad y privacidad", sub: "Contraseña y sesiones" },
          ],
        },
        {
          title: "Preferencias",
          items: [
            { icon: Bell, label: "Notificaciones", sub: "Correo y push" },
            { icon: Star, label: "Mis reseñas",    sub: "Ver y editar valoraciones" },
          ],
        },
      ].map((section) => (
        <div key={section.title} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 border-b border-slate-100">
            {section.title}
          </p>
          <div className="divide-y divide-slate-100">
            {section.items.map(({ icon: Icon, label, sub }) => (
              <button
                key={label}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{label}</p>
                  <p className="text-xs text-slate-400">{sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer w-full"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-semibold">Cerrar sesion</span>
      </button>

      {/* ── Edit modal ── */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Editar perfil</h2>
              <button onClick={() => setShowEdit(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Nombre *</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Apellido *</label>
                <input
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Teléfono</label>
                <input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 6621234567"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {saveError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">{saveError}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowEdit(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
