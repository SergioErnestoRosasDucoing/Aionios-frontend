// Ruta: src/app/(dashboard)/layout.tsx
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar (Menú lateral) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 font-bold text-xl text-blue-600">
          Aionios
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-2 rounded-md bg-blue-50 text-blue-700 font-medium">
            Inicio
          </Link>
          <Link href="#" className="block px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">
            Citas y Horarios
          </Link>
          <Link href="#" className="block px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">
            Mi Negocio
          </Link>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col">
        {/* Header superior */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            U
          </div>
        </header>
        
        {/* Aquí se inyectarán las páginas hijas */}
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}