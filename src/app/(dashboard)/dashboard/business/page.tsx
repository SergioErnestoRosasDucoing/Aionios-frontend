"use client";

import { useState, useEffect } from "react";
import { Building2, MapPin, Phone, Globe, ChevronRight, Upload } from "lucide-react";
import { businessService } from "@/services/business.service";
import { useMyBusiness } from "@/hooks/useMyBusiness";

export default function BusinessPage() {
  const { business, loading, error, setBusiness } = useMyBusiness();

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    direccion: "",
    telefono: "",
    slug: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (business) {
      setForm({
        nombre:      business.nombre,
        descripcion: business.descripcion,
        direccion:   business.direccion,
        telefono:    business.telefono,
        slug:        business.slug,
      });
    }
  }, [business]);

  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const updated = await businessService.update(business.id, form);
      setBusiness(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError("No se pudieron guardar los cambios. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-8 w-40 bg-slate-200 rounded" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-4xl mx-auto rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
        No tienes un negocio registrado. Crea uno desde el panel de administración.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi negocio</h1>
        <p className="text-slate-500 text-sm mt-0.5">Configura el perfil publico de tu negocio</p>
      </div>

      {/* Tarjeta perfil */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">Informacion general</h2>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold">
            {form.nombre.charAt(0) || "N"}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-1">Logo del negocio</p>
            <p className="text-xs text-slate-500 mb-3">PNG, JPG o WebP. Maximo 2 MB.</p>
            <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Subir imagen
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Nombre del negocio</label>
            <input
              value={form.nombre}
              onChange={handleChange("nombre")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Slug (URL)</span>
            </label>
            <input
              value={form.slug}
              onChange={handleChange("slug")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Telefono</span>
            </label>
            <input
              value={form.telefono}
              onChange={handleChange("telefono")}
              type="tel"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Direccion</span>
            </label>
            <input
              value={form.direccion}
              onChange={handleChange("direccion")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Descripcion</label>
            <textarea
              rows={3}
              value={form.descripcion}
              onChange={handleChange("descripcion")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
            />
          </div>
        </div>
      </div>

      {/* Guardar */}
      {saveError && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{saveError}</div>
      )}

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-400">
          {saved ? "✓ Cambios guardados correctamente" : "Los cambios se aplican de forma inmediata"}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setForm({
                nombre:      business.nombre,
                descripcion: business.descripcion,
                direccion:   business.direccion,
                telefono:    business.telefono,
                slug:        business.slug,
              });
              setSaveError(null);
            }}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
            {!saving && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
