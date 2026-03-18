import { NextRequest, NextResponse } from 'next/server'

// Routes accessibles sans authentification
const publicRoutes = ['/']

/**
 * Middleware Next.js exécuté côté serveur sur chaque requête entrante.
 * Gère la protection des routes en vérifiant la présence du token JWT
 * dans les cookies et redirige l'utilisateur selon son état de connexion.
 *
 * Comportement :
 * - Non connecté + route protégée → redirige vers "/"
 * - Connecté + route publique (login) → redirige vers "/dashboard"
 * - Tous les autres cas → laisse passer la requête normalement
 */
export function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

    // Utilisateur non connecté tentant d'accéder à une page protégée
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Utilisateur déjà connecté tentant d'accéder à la page de login
    if (token && isPublicRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

/**
 * Configuration du matcher : définit sur quelles routes le middleware s'applique.
 * Exclut les routes internes Next.js, les fichiers statiques et les favicons
 * pour éviter d'intercepter des ressources qui n'ont pas besoin d'authentification.
 */
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}