import { NextResponse } from 'next/server';

export function middleware(request) {
    const response = NextResponse.next();

    if (request.nextUrl.pathname.startsWith('/clipboard/')) {
        response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }

    return response;
}
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
