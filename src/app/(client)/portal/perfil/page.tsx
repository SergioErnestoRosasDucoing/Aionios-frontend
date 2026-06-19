"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, Bell, Star, CalendarDays,
  LogOut, X, Pencil, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/axios";
import { requestsService } from "@/services/requests.service";
import { reviewsService } from "@/services/reviews.service";
import type { Review } from "@/types/review.types";

// ── Notification prefs stored in localStorage ──────────────────────────────
const NOTIF_KEY = "aionios_notif_prefs";
interface NotifPrefs { recordatorios: boolean }
function loadNotifPrefs(): NotifPrefs {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) ?? "{}"); } catch { return {} as NotifPrefs; }
}

export default function PerfilPage() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();

  // ── stats ────────────────────────────────────────────────────────────────
  const [citasCount,  setCitasCount]  = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number | null>(null);

  // ── edit profile modal ───────────────────────────────────────────────────
  const [showEdit, setShowEdit]   = useState(false);
  const [nombre,   setNombre]     = useState("");
  const [apellido, setApellido]   = useState("");
  const [telefono, setTelefono]   = useState("");
  const [saving,   setSaving]     = useState(false);
  const [saveError,setSaveError]  = useState<string | null>(null);

  // ── notifications panel ──────────────────────────────────────────────────
  const [showNotif,   setShowNotif]   = useState(false);
  const [notifRecord, setNotifRecord] = useState(true);
  const [notifSaved,  setNotifSaved]  = useState(false);

  // ── reviews panel ────────────────────────────────────────────────────────
  const [showReviews,  setShowReviews]  = useState(false);
  const [reviews,      setReviews]      = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editComentario, setEditComentario] = useState("");
  const [editRating,     setEditRating]     = useState(5);
  const [reviewSaving,   setReviewSaving]   = useState(false);

  // ── delete account modal ─────────────────────────────────────────────────
  const [showDeleteStep1, setShowDeleteStep1] = useState(false);
  const [showDeleteStep2, setShowDeleteStep2] = useState(false);
  const [deleteInput,     setDeleteInput]     = useState("");
  const [deleting,        setDeleting]        = useState(false);
  const [deleteError,     setDeleteError]     = useState<string | null>(null);

  // ── init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      requestsService.getMine().catch(() => []),
      reviewsService.getMine().catch(() => []),
    ]).then(([citas, revs]) => {
      setCitasCount(citas.length);
      setReviewCount(revs.length);
    });

    const prefs = loadNotifPrefs();
    setNotifRecord(prefs.recordatorios ?? true);
  }, []);

  // ── handlers ─────────────────────────────────────────────────────────────
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
      await apiClient.patch("/users/me", {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim() || null,
      });
      updateUser({ nombre: nombre.trim(), apellido: apellido.trim(), telefono: telefono.trim() || undefined });
      setShowEdit(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setSaveError(typeof msg === "string" ? msg : "No se pudo guardar. Intenta de nuevo.");
    } finally { setSaving(false); }
  };

  const saveNotifPrefs = () => {
    const prefs: NotifPrefs = { recordatorios: notifRecord };
    localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  };

  const toggleReviews = () => {
    if (!showReviews && reviews.length === 0) {
      setReviewsLoading(true);
      reviewsService.getMine()
        .then(setReviews)
        .catch(() => setReviews([]))
        .finally(() => setReviewsLoading(false));
    }
    setShowReviews((v) => !v);
  };

  const openEditReview = (r: Review) => {
    setEditingReview(r);
    setEditComentario(r.comentario);
    setEditRating(r.rating);
  };

  const handleSaveReview = async () => {
    if (!editingReview) return;
    setReviewSaving(true);
    try {
      await apiClient.patch(`/reviews/${editingReview._id}`, {
        comentario: editComentario.trim(),
        rating: editRating,
      });
      setReviews((prev) =>
        prev.map((r) =>
          r._id === editingReview._id ? { ...r, comentario: editComentario.trim(), rating: editRating } : r
        )
      );
      setEditingReview(null);
    } catch { /* ignore */ }
    finally { setReviewSaving(false); }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await reviewsService.remove(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      setReviewCount((c) => (c !== null ? c - 1 : c));
    } catch { /* ignore */ }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "ELIMINAR") return;
    setDeleting(true); setDeleteError(null);
    try {
      await apiClient.delete("/users/me");
      logout();
      router.push("/login");
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setDeleteError(typeof msg === "string" ? msg : "No se pudo eliminar la cuenta. Intenta de nuevo.");
      setDeleting(false);
    }
  };

  // ── derived ───────────────────────────────────────────────────────────────
  const fullName  = user ? `${user.nombre} ${user.apellido}` : "Usuario";
  const initial   = user?.nombre?.charAt(0).toUpperCase() ?? "U";
  const joinMonth = new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* ── Header card ── */}
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
          {[
            { label: "Citas totales", value: citasCount  ?? "—", Icon: CalendarDays },
            { label: "Reseñas dadas", value: reviewCount ?? "—", Icon: Star         },
          ].map(({ label, value, Icon }) => (
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

      {/* ── Contact info ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 mb-1">Información de contacto</h2>
        {[
          { Icon: Mail,  value: user?.email    ?? "—" },
          { Icon: Phone, value: user?.telefono ?? "Sin teléfono" },
        ].map(({ Icon, value }) => (
          <div key={value} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-sm text-slate-700">{value}</span>
          </div>
        ))}
      </div>

      {/* ── Notificaciones ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setShowNotif((v) => !v)}
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">Notificaciones</p>
            <p className="text-xs text-slate-400">Preferencias de avisos</p>
          </div>
          {showNotif ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
        </button>

        {showNotif && (
          <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-800">Recordatorios de citas</p>
                <p className="text-xs text-slate-400">24 horas antes de tu cita</p>
              </div>
              <button
                onClick={() => setNotifRecord((v) => !v)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${notifRecord ? "bg-indigo-600" : "bg-slate-200"}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${notifRecord ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <button
              onClick={saveNotifPrefs}
              className="mt-2 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {notifSaved ? "¡Guardado!" : "Guardar preferencias"}
            </button>
          </div>
        )}
      </div>

      {/* ── Mis reseñas ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <button
          onClick={toggleReviews}
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Star className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">Mis reseñas</p>
            <p className="text-xs text-slate-400">Ver y editar valoraciones</p>
          </div>
          {showReviews ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
        </button>

        {showReviews && (
          <div className="border-t border-slate-100">
            {reviewsLoading ? (
              <p className="text-center text-sm text-slate-400 py-6">Cargando...</p>
            ) : reviews.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-6">Aún no has escrito ninguna reseña.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {reviews.map((r) => (
                  <div key={r._id} className="px-5 py-4 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
                          ))}
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-2">{r.comentario}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{new Date(r.fecha).toLocaleDateString("es-MX")}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openEditReview(r)}
                          className="text-indigo-500 hover:text-indigo-700 cursor-pointer"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(r._id)}
                          className="text-rose-400 hover:text-rose-600 cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Logout ── */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer w-full"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-semibold">Cerrar sesión</span>
      </button>

      {/* ── Delete account trigger ── */}
      <button
        onClick={() => setShowDeleteStep1(true)}
        className="flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-colors cursor-pointer w-full"
      >
        <Trash2 className="w-4 h-4" />
        <span className="text-sm font-semibold">Eliminar cuenta</span>
      </button>

      {/* ── Edit profile modal ── */}
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
              {[
                { label: "Nombre *",  value: nombre,   set: setNombre,   placeholder: "" },
                { label: "Apellido *",value: apellido, set: setApellido, placeholder: "" },
                { label: "Teléfono",  value: telefono, set: setTelefono, placeholder: "Ej. 6621234567" },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">{label}</label>
                  <input
                    aria-label={label}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
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

      {/* ── Edit review modal ── */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Editar reseña</h2>
              <button onClick={() => setEditingReview(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Calificación</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} onClick={() => setEditRating(s)} className="cursor-pointer">
                      <Star className={`w-6 h-6 ${s <= editRating ? "text-amber-400 fill-amber-400" : "text-slate-300 fill-slate-300"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Comentario</label>
                <textarea
                  value={editComentario}
                  onChange={(e) => setEditComentario(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingReview(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveReview} disabled={reviewSaving}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {reviewSaving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete account step 1 ── */}
      {showDeleteStep1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-rose-700">¿Eliminar tu cuenta?</h2>
              <button onClick={() => setShowDeleteStep1(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              Esta acción es <strong>irreversible</strong>. Se eliminarán permanentemente tus datos, historial de citas y reseñas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteStep1(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setShowDeleteStep1(false); setDeleteInput(""); setDeleteError(null); setShowDeleteStep2(true); }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete account step 2 ── */}
      {showDeleteStep2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-rose-700">Confirmar eliminación</h2>
              <button onClick={() => setShowDeleteStep2(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              Escribe <strong className="text-rose-700">ELIMINAR</strong> para confirmar que deseas borrar tu cuenta de forma permanente.
            </p>
            <input
              aria-label="Escribe ELIMINAR para confirmar la eliminación de tu cuenta"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="ELIMINAR"
              className="w-full px-3 py-2.5 bg-slate-50 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            {deleteError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">{deleteError}</div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteStep2(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== "ELIMINAR" || deleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {deleting ? "Eliminando..." : "Eliminar cuenta"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
