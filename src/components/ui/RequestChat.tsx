"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { requestsService } from "@/services/requests.service";
import type { RequestMessage } from "@/types/request.types";

const POLL_MS = 3_000;

interface Props {
  solicitudId: number;
  autorId: number;
  autorNombre: string;
  autorTipo: "cliente" | "negocio";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)  return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24)   return `hace ${h} h`;
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export default function RequestChat({ solicitudId, autorId, autorNombre, autorTipo }: Props) {
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [text,     setText]     = useState("");
  const [sending,  setSending]  = useState(false);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  // Guardamos el último ID conocido para no re-renderizar si no hay mensajes nuevos
  const lastIdRef    = useRef<string | null>(null);

  // ── Scroll inteligente: baja sólo si ya estás cerca del fondo ─────────────
  const scrollToBottom = useCallback((force = false) => {
    const box = scrollBoxRef.current;
    if (!box) return;
    const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    if (force || nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // ── Polling con ref para evitar stale closures ─────────────────────────────
  // La idea: el setInterval llama siempre a `pollRef.current`, que apunta
  // a la versión actualizada de la función sin recrear el intervalo.
  const pollRef = useRef<() => Promise<void>>();

  pollRef.current = async () => {
    try {
      const data = await requestsService.getMensajes(solicitudId);
      const newLastId = data.at(-1)?._id ?? null;
      if (newLastId !== lastIdRef.current) {
        lastIdRef.current = newLastId;
        setMessages(data);
      }
    } catch { /* silencioso */ }
  };

  useEffect(() => {
    let alive = true;

    const poll = () => { if (alive) pollRef.current?.(); };

    // Carga inicial
    setLoading(true);
    poll();
    // Pequeño retraso para que la primera carga se vea antes de mostrar el spinner
    Promise.resolve().then(() => { if (alive) setLoading(false); });

    const id = setInterval(poll, POLL_MS);

    // Pausa cuando el tab está oculto; refresco inmediato al volver
    const onVisibility = () => {
      if (!document.hidden) poll();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [solicitudId]); // sólo se recrea si cambia el ID de la solicitud

  // Scroll cuando llegan mensajes nuevos
  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // ── Envío con actualización optimista ─────────────────────────────────────
  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const tempId = `tmp_${Date.now()}`;
    const optimistic: RequestMessage = {
      _id:          tempId,
      solicitud_id: solicitudId,
      autor_id:     autorId,
      autor_nombre: autorNombre,
      autor_tipo:   autorTipo,
      texto:        trimmed,
      createdAt:    new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setText("");
    setSending(true);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const real = await requestsService.addMensaje(solicitudId, {
        autor_id:     autorId,
        autor_nombre: autorNombre,
        autor_tipo:   autorTipo,
        texto:        trimmed,
      });
      // Reemplaza el optimista con el real y actualiza el lastId
      setMessages((prev) => prev.map((m) => (m._id === tempId ? real : m)));
      lastIdRef.current = real._id;
    } catch {
      // Revierte si falla
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Indicador en vivo */}
      <div className="flex items-center gap-1.5 px-1 mb-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[10px] text-slate-400 font-medium">En vivo · actualiza cada 3 s</span>
      </div>

      {/* Mensajes */}
      <div
        ref={scrollBoxRef}
        className="flex-1 overflow-y-auto space-y-3 px-1 py-2 min-h-[200px] max-h-[320px]"
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <MessageSquare className="w-8 h-8 text-slate-200" />
            <p className="text-xs text-slate-400">
              Inicia la conversación para coordinar los detalles del servicio.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe   = m.autor_id === autorId;
            const isTemp = m._id.startsWith("tmp_");
            return (
              <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] space-y-0.5 ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                  {!isMe && (
                    <p className="text-[10px] text-slate-400 px-1">
                      {m.autor_nombre} · {m.autor_tipo === "negocio" ? "Negocio" : "Cliente"}
                    </p>
                  )}
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-snug transition-opacity ${
                    isTemp ? "opacity-60" : "opacity-100"
                  } ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-800 rounded-bl-sm"
                  }`}>
                    {m.texto}
                  </div>
                  <p className="text-[10px] text-slate-400 px-1">
                    {isTemp ? "Enviando…" : timeAgo(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-slate-100 mt-2">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribe un mensaje... (Enter para enviar)"
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-400"
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
        >
          {sending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Send className="w-4 h-4" />
          }
        </button>
      </div>
    </div>
  );
}
