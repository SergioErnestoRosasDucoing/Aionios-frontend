"use client";

import { useState, useEffect } from "react";
import { businessService } from "@/services/business.service";
import { useAuth } from "@/context/AuthContext";
import type { Business } from "@/types/business.types";

export function useMyBusiness() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    businessService
      .getAll()
      .then((all) => {
        setBusiness(all.find((b) => b.id_dueno === user.id) ?? null);
      })
      .catch(() => setError("No se pudo cargar el negocio"))
      .finally(() => setLoading(false));
  }, [user]);

  return { business, loading, error, setBusiness };
}
