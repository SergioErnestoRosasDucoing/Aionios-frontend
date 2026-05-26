// Ruta: src/app/(dashboard)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Panel de Control</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjetas de métricas de ejemplo */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Citas Hoy</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Nuevos Clientes</h3>
          <p className="text-3xl font-bold mt-2">4</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Ingresos Semanales</h3>
          <p className="text-3xl font-bold mt-2">$4,200</p>
        </div>
      </div>
    </div>
  );
}