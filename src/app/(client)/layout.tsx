"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientNav from "@/components/layout/ClientNav";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/types/auth.types";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.id_rol !== ROLES.CLIENT) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.id_rol !== ROLES.CLIENT) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <ClientNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
        {children}
      </main>
    </div>
  );
}
