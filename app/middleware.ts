import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAdminPath = pathname.startsWith('/dashboard');
  const isStaffPath = pathname.startsWith('/staff/dashboard');

  // Allow auth-related paths to be accessed
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/staff/login') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // If trying to access a protected path without a token
  if (!token) {
    if (isAdminPath) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (isStaffPath) {
      return NextResponse.redirect(new URL('/staff/login', req.url));
    }
    // If accessing root or other non-dashboard paths, just continue
    return NextResponse.next();
  }

  // If token exists, handle role-based access
  const role = token.role as string;
  const isAdminRole = role === 'admin' || role === 'frontdesk';
  const isStaffRole = role === 'housekeeping' || role === 'maintenance';

  // If a frontdesk user tries to access restricted admin paths
  if (role === 'frontdesk' && (pathname.startsWith('/dashboard/reports') || pathname.startsWith('/dashboard/staff'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If an admin/frontdesk tries to access staff paths, redirect to admin dashboard
  if (isStaffPath && isAdminRole) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If a staff member tries to access admin paths, redirect to staff dashboard
  if (isAdminPath && isStaffRole) {
    return NextResponse.redirect(new URL('/staff/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/staff/:path*', '/login'],
};