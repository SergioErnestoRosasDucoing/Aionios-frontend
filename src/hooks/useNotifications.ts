"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { notificationsService } from "@/services/notifications.service";
import type { Notificacion } from "@/types/notification.types";

const POLL_INTERVAL = 30_000; // 30 segundos
const LIMIT = 10;

/** Filtra notificaciones genéricas del interceptor que aún estén en la BD */
function isLegacy(n: Notificacion) {
  return n.titulo === "Actividad registrada";
}

export function useNotifications(usuarioId: number | undefined) {
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [loading, setLoading]             = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cleanedRef  = useRef(false); // solo limpiamos legacy una vez por sesión

  const fetchNotifications = useCallback(async () => {
    if (!usuarioId) return;
    try {
      const data = await notificationsService.getByUser(usuarioId, LIMIT);
      setNotifications(data.filter((n) => !isLegacy(n)));
    } catch {
      // silencioso — no romper la UI
    }
  }, [usuarioId]);

  // Carga inicial + limpieza de legacy + polling
  useEffect(() => {
    if (!usuarioId) return;

    // Limpieza de las notificaciones antiguas del interceptor (una sola vez por sesión)
    if (!cleanedRef.current) {
      cleanedRef.current = true;
      notificationsService.clearLegacy(usuarioId).catch(() => {});
    }

    setLoading(true);
    notificationsService
      .getByUser(usuarioId, LIMIT)
      .then((data) => setNotifications(data.filter((n) => !isLegacy(n))))
      .catch(() => {})
      .finally(() => setLoading(false));

    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);

    const onVisible = () => {
      if (document.visibilityState === "visible") fetchNotifications();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [usuarioId, fetchNotifications]);

  const remove = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await notificationsService.remove(id);
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, leido: true } : n))
    );
    try {
      await notificationsService.markRead(id);
    } catch {
      // silencioso — no crítico
    }
  }, []);

  const unread = notifications.filter((n) => !n.leido).length;

  return { notifications, unread, loading, remove, markRead, refetch: fetchNotifications };
}
