import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return new NextResponse(
      JSON.stringify({ message: 'Authentication token is missing.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    
    // A better approach might be to use a custom request type.
    (req as any).user = payload;

    return NextResponse.next();
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: 'Invalid or expired token.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/menu/:path*',
    '/api/menu-items/:path*',
    '/api/menu-ratings/:path*',
    '/api/selections/:path*',
  ],
};