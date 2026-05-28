"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { notificationsService } from "@/services/notifications.service";
import type { Notificacion } from "@/types/notification.types";

const POLL_INTERVAL = 30_000; // 30 segundos

export function useNotifications(usuarioId: number | undefined) {
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    if (!usuarioId) return;
    try {
      const data = await notificationsService.getByUser(usuarioId);
      setNotifications(data);
    } catch {
      // silencioso — no romper la UI si falla la red
    }
  }, [usuarioId]);

  // Carga inicial + polling
  useEffect(() => {
    if (!usuarioId) return;

    setLoading(true);
    notificationsService
      .getByUser(usuarioId)
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));

    intervalRef.current = setInterval(fetch, POLL_INTERVAL);

    // Refresca cuando el tab vuelve a estar visible
    const onVisible = () => { if (document.visibilityState === "visible") fetch(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [usuarioId, fetch]);

  const remove = useCallback(async (id: string) => {
    // Optimista: quitar de la lista de inmediato
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await notificationsService.remove(id);
    } catch {
      // Si falla, volver a cargar para restaurar el estado real
      fetch();
    }
  }, [fetch]);

  const unread = notifications.filter((n) => !n.leido).length;

  return { notifications, unread, loading, remove, refetch: fetch };
}
