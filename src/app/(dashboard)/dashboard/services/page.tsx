"use client";

import { useState, useEffect } from "react";
import { Scissors, Plus, Search, Clock, DollarSign, MoreHorizontal, X, Pencil, Trash2 } from "lucide-react";
import { servicesService } from "@/services/services.service";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import type { Service, CreateServicePayload, UpdateServicePayload } from "@/types/service.types";

const EMPTY_FORM = { nombre: "", descripcion: "", precio: 0, duracionMinutos: 30 };

type FormState = typeof EMPTY_FORM;

export default function ServicesPage() {
  const { business, loading: bizLoading } = useMyBusiness();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Create modal
  const [showCreate, setShowCreate]   = useState(false);
  const [createForm, setCreateForm]   = useState<FormState>(EMPTY_FORM);
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit modal
  const [editSvc, setEditSvc]     = useState<Service | null>(null);
  const [editForm, setEditForm]   = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (bizLoading) return;
    if (!business) { setLoading(false); return; }
    servicesService
      .getByBusiness(business.id)
      .then(setServices)
      .catch(() => setError("No se pudieron cargar los servicios."))
      .finally(() => setLoading(false));
  }, [business, bizLoading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [menuOpen]);

  const filtered = services.filter((s) =>
    s.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (mongoId: string) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    await servicesService.remove(mongoId);
    setServices((prev) => prev.filter((s) => s._id !== mongoId));
  };

  // ── Create ──
  const openCreate = () => {
    if (!business) return;
    setCreateForm(EMPTY_FORM);
    setCreateError(null);
    setShowCreate(true);
  };

  const handleCreate = async () => {
    if (!business) return;
    if (!createForm.nombre.trim() || !createForm.descripcion.trim()) {
      setCreateError("Nombre y descripción son obligatorios.");
      return;
    }
    setCreating(true); setCreateError(null);
    try {
      const created = await servicesService.create({ ...createForm, negocio_id: business.id });
      setServices((prev) => [created, ...prev]);
      setShowCreate(false);
    } catch {
      setCreateError("No se pudo crear el servicio. Intenta de nuevo.");
    } finally { setCreating(false); }
  };

  // ── Edit ──
  const openEdit = (svc: Service) => {
    setEditSvc(svc);
    setEditForm({ nombre: svc.nombre, descripcion: svc.descripcion, precio: svc.precio, duracionMinutos: svc.duracionMinutos });
    setEditError(null);
    setMenuOpen(null);
  };

  const handleSave = async () => {
    if (!editSvc) return;
    if (!editForm.nombre.trim() || !editForm.descripcion.trim()) {
      setEditError("Nombre y descripción son obligatorios.");
      return;
    }
    setSaving(true); setEditError(null);
    try {
      const updated = await servicesService.update(editSvc._id, editForm as UpdateServicePayload);
      setServices((prev) => prev.map((s) => (s._id === editSvc._id ? updated : s)));
      setEditSvc(null);
    } catch {
      setEditError("No se pudo guardar. Intenta de nuevo.");
    } finally { setSaving(false); }
  };

  if (bizLoading || loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  function ServiceFormFields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Nombre *</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej. Corte de cabello"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Descripcion *</label>
          <textarea
            rows={2}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Describe brevemente el servicio..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Precio ($)</label>
            <input
              type="number" min={0}
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Duracion (min)</label>
            <input
              type="number" min={1}
              value={form.duracionMinutos}
              onChange={(e) => setForm({ ...form, duracionMinutos: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catalogo de servicios</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {filtered.length} servicio{filtered.length !== 1 ? "s" : ""} registrado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={!business}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Nuevo servicio
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">{error}</div>
      )}

      {!business && !error && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
          No tienes un negocio registrado. Crea uno primero desde la sección <strong>Mi negocio</strong>.
        </div>
      )}

      {business && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar servicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>
        </div>
      )}

      {business && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 && !loading ? (
            <p className="col-span-full text-center text-slate-400 py-12">
              {services.length === 0 ? "Aun no tienes servicios. Agrega el primero." : "Sin resultados para tu busqueda."}
            </p>
          ) : (
            filtered.map((svc) => (
              <div
                key={svc._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Scissors className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-tight">{svc.nombre}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{svc.descripcion}</p>
                    </div>
                  </div>

                  {/* Dropdown menu */}
                  <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setMenuOpen(menuOpen === svc._id ? null : svc._id)}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuOpen === svc._id && (
                      <div className="absolute right-0 top-7 z-10 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-36">
                        <button
                          onClick={() => openEdit(svc)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button
                          onClick={() => { setMenuOpen(null); handleDelete(svc._id); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-slate-700">
                      <DollarSign className="w-3 h-3" />
                      <span className="text-sm font-bold">{svc.precio.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Precio</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-slate-700">
                      <Clock className="w-3 h-3" />
                      <span className="text-sm font-bold">{svc.duracionMinutos}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Min</p>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1 border-t border-slate-100 gap-2">
                  <button
                    onClick={() => openEdit(svc)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                  >
                    Editar
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => handleDelete(svc._id)}
                    className="text-xs font-medium text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}

          <button
            onClick={openCreate}
            className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-5 flex flex-col items-center justify-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer min-h-[200px]"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Plus className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">Agregar servicio</p>
              <p className="text-xs text-slate-400 mt-0.5">Haz clic para crear uno nuevo</p>
            </div>
          </button>
        </div>
      )}

      {/* ── Create modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Nuevo servicio</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            {createError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{createError}</div>
            )}
            <ServiceFormFields form={createForm} setForm={setCreateForm} />
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate} disabled={creating}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {creating ? "Creando..." : "Crear servicio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editSvc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Editar servicio</h2>
              <button onClick={() => setEditSvc(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            {editError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{editError}</div>
            )}
            <ServiceFormFields form={editForm} setForm={setEditForm} />
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setEditSvc(null)}
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
