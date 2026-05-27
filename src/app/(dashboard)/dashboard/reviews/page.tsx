import { Star, TrendingUp, MessageSquare, ThumbsUp } from "lucide-react";

interface Review {
  id: number;
  client: string;
  rating: number;
  service: string;
  date: string;
  comment: string;
  replied: boolean;
}

const reviews: Review[] = [
  {
    id: 1,
    client: "Maria Lopez",
    rating: 5,
    service: "Corte y peinado",
    date: "25 may 2026",
    comment: "Excelente servicio, muy profesional y el resultado fue exactamente lo que pedi. Totalmente recomendado.",
    replied: true,
  },
  {
    id: 2,
    client: "Carlos Ramirez",
    rating: 5,
    service: "Tinte completo",
    date: "24 may 2026",
    comment: "El mejor salon que he visitado. El tinte quedo perfecto y el trato fue muy amable.",
    replied: false,
  },
  {
    id: 3,
    client: "Sofia Torres",
    rating: 4,
    service: "Manicure",
    date: "23 may 2026",
    comment: "Muy buen trabajo, me gusto mucho el resultado. Solo tardaron un poco mas de lo esperado.",
    replied: true,
  },
  {
    id: 4,
    client: "Valeria Gutierrez",
    rating: 5,
    service: "Pedicure spa",
    date: "22 may 2026",
    comment: "Una experiencia relajante y el servicio fue de primera. Sin duda volvere.",
    replied: false,
  },
  {
    id: 5,
    client: "Luis Herrera",
    rating: 3,
    service: "Tratamiento capilar",
    date: "20 may 2026",
    comment: "El servicio estuvo bien, pero esperaba mejores resultados con el tratamiento.",
    replied: false,
  },
  {
    id: 6,
    client: "Laura Castillo",
    rating: 5,
    service: "Brushing",
    date: "19 may 2026",
    comment: "Me encanto. El brushing duro todo el dia y quedé muy contenta con el resultado.",
    replied: true,
  },
];

const ratingDist = [
  { stars: 5, count: 24 },
  { stars: 4, count: 8 },
  { stars: 3, count: 4 },
  { stars: 2, count: 1 },
  { stars: 1, count: 1 },
];
const totalReviews = ratingDist.reduce((s, r) => s + r.count, 0);
const avgRating = (
  ratingDist.reduce((s, r) => s + r.stars * r.count, 0) / totalReviews
).toFixed(1);

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sizeClass} ${s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const pendingReplies = reviews.filter((r) => !r.replied).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resenas y valoraciones</h1>
        <p className="text-slate-500 text-sm mt-0.5">Lo que dicen tus clientes sobre tu negocio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo — resumen */}
        <div className="space-y-4">
          {/* Puntuacion general */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
            <p className="text-6xl font-bold text-slate-900">{avgRating}</p>
            <StarDisplay rating={Math.round(Number(avgRating))} size="lg" />
            <p className="text-sm text-slate-500 mt-2">{totalReviews} resenas totales</p>
          </div>

          {/* Distribucion */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Distribucion</h3>
            <div className="space-y-2.5">
              {ratingDist.map((r) => (
                <div key={r.stars} className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 w-16 flex-shrink-0">
                    <span className="text-xs text-slate-600 font-medium">{r.stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${(r.count / totalReviews) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-6 text-right">{r.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metricas */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Sin responder", value: pendingReplies, icon: MessageSquare, color: "text-amber-600 bg-amber-50" },
              { label: "Recomendarian", value: "96%", icon: ThumbsUp, color: "text-emerald-600 bg-emerald-50" },
              { label: "Este mes", value: "14", icon: Star, color: "text-indigo-600 bg-indigo-50" },
              { label: "Crecimiento", value: "+22%", icon: TrendingUp, color: "text-violet-600 bg-violet-50" },
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

        {/* Panel derecho — Lista de resenas */}
        <div className="lg:col-span-2 space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
                    {review.client.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{review.client}</p>
                    <p className="text-xs text-slate-500">{review.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StarDisplay rating={review.rating} />
                  <p className="text-xs text-slate-400 mt-1">{review.date}</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                {review.replied ? (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Respondida
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 font-medium">Sin responder</span>
                )}
                <button className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer">
                  {review.replied ? "Ver respuesta" : "Responder"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
