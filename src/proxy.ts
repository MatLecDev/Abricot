import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/']

export function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    if (token && isPublicRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}