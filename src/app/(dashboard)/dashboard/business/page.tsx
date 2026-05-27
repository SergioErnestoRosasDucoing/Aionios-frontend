"use client";

import { useState, useEffect } from "react";
import { Building2, MapPin, Phone, Globe, ChevronRight, Plus, Palette, CheckCircle } from "lucide-react";
import { businessService } from "@/services/business.service";
import { businessUiService } from "@/services/business-ui.service";
import { useAuth } from "@/context/AuthContext";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import type { BusinessUiConfig } from "@/types/business-ui.types";

const COLOR_OPTIONS = [
  { label: "Índigo",    hex: "#4F46E5" },
  { label: "Violeta",  hex: "#7C3AED" },
  { label: "Rosa",     hex: "#DB2777" },
  { label: "Rojo",     hex: "#E11D48" },
  { label: "Esmeralda",hex: "#059669" },
  { label: "Ámbar",    hex: "#D97706" },
  { label: "Cian",     hex: "#0891B2" },
  { label: "Pizarra",  hex: "#475569" },
];

export default function BusinessPage() {
  const { user } = useAuth();
  const { business, loading, error, setBusiness } = useMyBusiness();

  const [form, setForm] = useState({
    nombre: "", descripcion: "", direccion: "", telefono_comercial: "", slug: "",
  });
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved]         = useState(false);

  const [creating, setCreating]     = useState(false);
  const [createForm, setCreateForm] = useState({
    nombre: "", descripcion: "", direccion: "", telefono_comercial: "", slug: "",
  });
  const [createError, setCreateError] = useState<string | null>(null);

  // Apariencia
  const [uiConfig, setUiConfig]         = useState<BusinessUiConfig | null>(null);
  const [uiForm, setUiForm]             = useState({ color_primario: "#4F46E5", slogan: "", descripcion_corta: "" });
  const [savingUi, setSavingUi]         = useState(false);
  const [uiError, setUiError]           = useState<string | null>(null);
  const [uiSaved, setUiSaved]           = useState(false);

  useEffect(() => {
    if (business) {
      setForm({
        nombre:             business.nombre,
        descripcion:        business.descripcion,
        direccion:          business.direccion ?? "",
        telefono_comercial: business.telefono_comercial ?? "",
        slug:               business.slug,
      });
      businessUiService.getByNegocio(business.id)
        .then((cfg) => {
          if (cfg) {
            setUiConfig(cfg);
            setUiForm({
              color_primario:   cfg.color_primario   || "#4F46E5",
              slogan:           cfg.slogan           || "",
              descripcion_corta:cfg.descripcion_corta|| "",
            });
          }
        })
        .catch(() => {});
    }
  }, [business]);

  const handleChange = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!business) return;
    setSaving(true); setSaveError(null); setSaved(false);
    try {
      const updated = await businessService.update(business.id, form);
      setBusiness(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError("No se pudieron guardar los cambios. Intenta de nuevo.");
    } finally { setSaving(false); }
  };

  const handleSaveUi = async () => {
    if (!business) return;
    setSavingUi(true); setUiError(null); setUiSaved(false);
    try {
      const updated = await businessUiService.upsert(business.id, uiForm);
      setUiConfig(updated);
      setUiSaved(true);
      setTimeout(() => setUiSaved(false), 3000);
    } catch {
      setUiError("No se pudo guardar la apariencia. Intenta de nuevo.");
    } finally { setSavingUi(false); }
  };

  const handleCreate = async () => {
    if (!user) return;
    const { nombre, descripcion, direccion, telefono_comercial, slug } = createForm;
    if (!nombre || !descripcion || !direccion || !telefono_comercial || !slug) {
      setCreateError("Por favor completa todos los campos.");
      return;
    }
    setCreating(true); setCreateError(null);
    try {
      const newBiz = await businessService.create({ nombre, descripcion, direccion, telefono_comercial, slug, id_dueno: user.id });
      setBusiness(newBiz);
    } catch {
      setCreateError("No se pudo crear el negocio. Intenta de nuevo.");
    } finally { setCreating(false); }
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mi negocio</h1>
          <p className="text-slate-500 text-sm mt-0.5">Registra tu negocio para comenzar a recibir citas</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">Crear negocio</h2>
          </div>
          {createError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{createError}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { field: "nombre",             label: "Nombre del negocio", placeholder: "Mi Negocio SA"    },
              { field: "slug",               label: "Slug (URL)",          placeholder: "mi-negocio"       },
              { field: "telefono_comercial", label: "Teléfono",           placeholder: "4771234567"       },
              { field: "direccion",          label: "Dirección",           placeholder: "Calle 123, Ciudad"},
            ].map(({ field, label, placeholder }) => (
              <div key={field} className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">{label}</label>
                <input
                  value={createForm[field as keyof typeof createForm]}
                  onChange={(e) => setCreateForm((p) => ({ ...p, [field]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            ))}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Descripción</label>
              <textarea
                rows={3}
                value={createForm.descripcion}
                onChange={(e) => setCreateForm((p) => ({ ...p, descripcion: e.target.value }))}
                placeholder="Describe brevemente tu negocio..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {creating ? "Creando..." : "Crear negocio"}
              {!creating && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi negocio</h1>
        <p className="text-slate-500 text-sm mt-0.5">Configura el perfil público de tu negocio</p>
      </div>

      {/* ── Información general ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">Información general</h2>
        </div>

        {/* Avatar generado */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
            style={{ backgroundColor: uiForm.color_primario }}
          >
            {form.nombre.charAt(0) || "N"}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{form.nombre || "Tu negocio"}</p>
            <p className="text-xs text-slate-500 mt-0.5">{uiForm.slogan || "Sin slogan"}</p>
            <p className="text-xs text-slate-400 mt-1">El avatar usa la inicial y el color de acento</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Nombre del negocio</label>
            <input value={form.nombre} onChange={handleChange("nombre")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Slug (URL)</span>
            </label>
            <input value={form.slug} onChange={handleChange("slug")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Teléfono</span>
            </label>
            <input value={form.telefono_comercial} onChange={handleChange("telefono_comercial")} type="tel"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Dirección</span>
            </label>
            <input value={form.direccion} onChange={handleChange("direccion")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Descripción</label>
            <textarea rows={3} value={form.descripcion} onChange={handleChange("descripcion")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
          </div>
        </div>

        {saveError && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{saveError}</div>
        )}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {saved ? "✓ Cambios guardados" : "Los cambios se aplican de forma inmediata"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setForm({ nombre: business.nombre, descripcion: business.descripcion, direccion: business.direccion ?? "", telefono_comercial: business.telefono_comercial ?? "", slug: business.slug })}
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

      {/* ── Apariencia ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">Apariencia del perfil público</h2>
        </div>

        <div className="space-y-5">
          {/* Preview */}
          <div
            className="rounded-2xl overflow-hidden h-24 flex items-end p-4 relative"
            style={{ background: `linear-gradient(135deg, ${uiForm.color_primario}, ${uiForm.color_primario}99)` }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative flex items-end gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl font-bold" style={{ color: uiForm.color_primario }}>
                {form.nombre.charAt(0) || "N"}
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">{form.nombre || "Tu negocio"}</p>
                {uiForm.slogan && <p className="text-white/80 text-xs">{uiForm.slogan}</p>}
              </div>
            </div>
          </div>

          {/* Color de acento */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Color de acento</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(({ hex, label }) => (
                <button
                  key={hex}
                  title={label}
                  onClick={() => setUiForm((p) => ({ ...p, color_primario: hex }))}
                  className="w-8 h-8 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center"
                  style={{
                    backgroundColor: hex,
                    borderColor: uiForm.color_primario === hex ? "#1e293b" : "transparent",
                    transform: uiForm.color_primario === hex ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  {uiForm.color_primario === hex && <CheckCircle className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Slogan */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Slogan</label>
            <input
              value={uiForm.slogan}
              onChange={(e) => setUiForm((p) => ({ ...p, slogan: e.target.value }))}
              placeholder="Ej. Tu estilo, nuestra pasión"
              maxLength={80}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <p className="text-xs text-slate-400 text-right">{uiForm.slogan.length}/80</p>
          </div>

          {/* Descripción corta */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Descripción corta</label>
            <textarea
              rows={2}
              value={uiForm.descripcion_corta}
              onChange={(e) => setUiForm((p) => ({ ...p, descripcion_corta: e.target.value }))}
              placeholder="Una línea que resuma lo que ofreces (aparece en las tarjetas del portal)"
              maxLength={120}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            />
            <p className="text-xs text-slate-400 text-right">{uiForm.descripcion_corta.length}/120</p>
          </div>
        </div>

        {uiError && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{uiError}</div>
        )}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {uiSaved ? "✓ Apariencia guardada" : "Se aplica en tu perfil público del portal"}
          </p>
          <button
            onClick={handleSaveUi}
            disabled={savingUi}
            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {savingUi ? "Guardando..." : "Guardar apariencia"}
          </button>
        </div>
      </div>
    </div>
  );
}
