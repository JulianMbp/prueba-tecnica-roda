import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Rutas que requieren autenticación
  const protectedRoutes = ['/schedule', '/credits', '/payments'];
  
  // Si está en la ruta raíz, permitir acceso (se maneja en el componente)
  if (pathname === '/') {
    return NextResponse.next();
  }
  
  // Si es una ruta protegida, verificar si hay información de cliente en localStorage
  // Nota: En middleware no podemos acceder a localStorage directamente
  // La lógica de autenticación se maneja en los componentes
  if (protectedRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
