'use client';

export function Footer() {
  return (
    <footer className="bg-roda-gray-100 border-t border-roda-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-roda-gray-600">
            © {new Date().getFullYear()} Julian Bastidas. Todos los derechos reservados.
          </div>
          <div className="text-sm text-roda-gray-600 mt-2 sm:mt-0">
            Hecho con ❤️ por Julian Bastidas
          </div>
        </div>
      </div>
    </footer>
  );
}
