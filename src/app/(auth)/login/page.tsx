// Ruta: src/app/(auth)/login/page.tsx
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Iniciar Sesión en Aionios</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="correo@ejemplo.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="••••••••" />
          </div>
          <Link href="/dashboard" className="w-full block text-center bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Entrar al sistema
          </Link>
        </form>
      </div>
    </div>
  );
}