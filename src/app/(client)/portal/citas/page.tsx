"use client";

import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";

export default function CitasPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis citas</h1>
          <p className="text-slate-500 text-sm mt-0.5">Aqui apareceran tus citas agendadas</p>
        </div>
        <Link
          href="/portal/explorar"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva cita
        </Link>
      </div>

      <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
        <CalendarDays className="w-14 h-14 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-700 font-semibold text-base">Aun no tienes citas</p>
        <p className="text-slate-400 text-sm mt-1 mb-6">
          Cuando agendes una cita con algun negocio, aparecera aqui.
        </p>
        <Link
          href="/portal/explorar"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Explorar negocios
        </Link>
      </div>
    </div>
  );
}
