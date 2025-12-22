import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const AUTH_COOKIE_NAME = "wedding_admin_auth";

/**
 * Verify if request is authenticated
 * Checks for auth cookie or Authorization header
 */
export async function verifyAuth(request: NextRequest): Promise<{ success: boolean }> {
  // Check Authorization header (for API calls)
  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    const [type, token] = authHeader.split(" ");
    if (type === "Bearer" && token === ADMIN_PASSWORD) {
      return { success: true };
    }
  }

  // Check cookie (for page loads)
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  if (authCookie?.value === ADMIN_PASSWORD) {
    return { success: true };
  }

  return { success: false };
}

/**
 * Verify password and set auth cookie
 */
export async function login(password: string): Promise<boolean> {
  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return true;
  }
  return false;
}

/**
 * Clear auth cookie
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Check if user is authenticated (for server components)
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  return authCookie?.value === ADMIN_PASSWORD;
}
