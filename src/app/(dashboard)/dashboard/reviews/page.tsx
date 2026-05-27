"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, ThumbsUp, TrendingUp, Send, X } from "lucide-react";
import { reviewsService } from "@/services/reviews.service";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import type { Review } from "@/types/review.types";

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}`}
        />
      ))}
    </div>
  );
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function clientInitial(review: Review): string {
  const name = review.nombre_cliente ?? `Cliente ${review.usuario_id}`;
  return name.charAt(0).toUpperCase();
}

function clientName(review: Review): string {
  return review.nombre_cliente ?? `Cliente #${review.usuario_id}`;
}

export default function ReviewsPage() {
  const { business, loading: bizLoading } = useMyBusiness();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (bizLoading) return;
    if (!business) { setLoading(false); return; }

    reviewsService
      .getByNegocio(business.id)
      .then(setReviews)
      .catch(() => setError("No se pudieron cargar las reseñas."))
      .finally(() => setLoading(false));
  }, [business, bizLoading]);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const updated = await reviewsService.addRespuesta(reviewId, replyText.trim());
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? updated : r)));
      setReplyingTo(null);
      setReplyText("");
    } catch {
      // silently ignore
    } finally {
      setSending(false);
    }
  };

  // Stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const ratingDist = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  const pendingReplies = reviews.filter((r) => !r.respuesta).length;
  const thisMonth = reviews.filter((r) => {
    const d = new Date(r.createdAt ?? r.fecha);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const fiveStarPct = totalReviews > 0
    ? Math.round((reviews.filter((r) => r.rating >= 4).length / totalReviews) * 100)
    : 0;

  if (bizLoading || loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="h-40 bg-slate-100 rounded-2xl" />
            <div className="h-48 bg-slate-100 rounded-2xl" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            {[0, 1, 2].map((i) => <div key={i} className="h-40 bg-slate-100 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reseñas y valoraciones</h1>
        <p className="text-slate-500 text-sm mt-0.5">Lo que dicen tus clientes sobre tu negocio</p>
      </div>

      {!business && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
          No tienes un negocio registrado. Crea uno desde <strong>Mi negocio</strong>.
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo */}
        <div className="space-y-4">
          {/* Puntuación general */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
            <p className="text-6xl font-bold text-slate-900">{avgRating}</p>
            <div className="flex justify-center mt-2">
              <StarDisplay rating={Math.round(Number(avgRating))} size="lg" />
            </div>
            <p className="text-sm text-slate-500 mt-2">{totalReviews} reseña{totalReviews !== 1 ? "s" : ""} totales</p>
          </div>

          {/* Distribución */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Distribución</h3>
            <div className="space-y-2.5">
              {ratingDist.map((r) => (
                <div key={r.stars} className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 w-10 flex-shrink-0">
                    <span className="text-xs text-slate-600 font-medium">{r.stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: totalReviews > 0 ? `${(r.count / totalReviews) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-5 text-right">{r.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Sin responder", value: pendingReplies, icon: MessageSquare, color: "text-amber-600 bg-amber-50" },
              { label: "Recomendarían", value: `${fiveStarPct}%`, icon: ThumbsUp, color: "text-emerald-600 bg-emerald-50" },
              { label: "Este mes", value: thisMonth, icon: Star, color: "text-indigo-600 bg-indigo-50" },
              { label: "Total", value: totalReviews, icon: TrendingUp, color: "text-violet-600 bg-violet-50" },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${m.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-lg font-bold text-slate-900">{m.value}</p>
                  <p className="text-xs text-slate-500">{m.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de reseñas */}
        <div className="lg:col-span-2 space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Aún no tienes reseñas. Aparecerán aquí cuando tus clientes las dejen.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold flex-shrink-0">
                      {clientInitial(review)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{clientName(review)}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StarDisplay rating={review.rating} />
                    <p className="text-xs text-slate-400 mt-1">
                      {formatFecha(review.createdAt ?? review.fecha)}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">{review.comentario}</p>

                {/* Respuesta existente */}
                {review.respuesta && (
                  <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-indigo-700 mb-1">Tu respuesta</p>
                    <p className="text-xs text-indigo-600 leading-relaxed">{review.respuesta}</p>
                    {review.fecha_respuesta && (
                      <p className="text-[10px] text-indigo-400 mt-1">{formatFecha(review.fecha_respuesta)}</p>
                    )}
                  </div>
                )}

                {/* Caja de respuesta inline */}
                {replyingTo === review._id && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escribe tu respuesta..."
                      autoFocus
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-400"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReply(review._id)}
                        disabled={sending || !replyText.trim()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Send className="w-3 h-3" />
                        {sending ? "Enviando..." : "Enviar"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  {review.respuesta ? (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Respondida
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">Sin responder</span>
                  )}
                  {replyingTo !== review._id && (
                    <button
                      onClick={() => { setReplyingTo(review._id); setReplyText(review.respuesta ?? ""); }}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                    >
                      {review.respuesta ? "Editar respuesta" : "Responder"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
