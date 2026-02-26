import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "wedding_admin_auth";

function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  return typeof password === "string" && password.length > 0 ? password : null;
}

/**
 * Verify if request is authenticated
 * Checks for auth cookie or Authorization header
 */
export async function verifyAuth(request: NextRequest): Promise<{ success: boolean }> {
  const adminPassword = getAdminPassword();
  if (!adminPassword) {
    return { success: false };
  }

  // Check Authorization header (for API calls)
  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    const [type, token] = authHeader.split(" ");
    if (type === "Bearer" && token === adminPassword) {
      return { success: true };
    }
  }

  // Check cookie (for page loads)
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  if (authCookie?.value === adminPassword) {
    return { success: true };
  }

  return { success: false };
}

/**
 * Verify password and set auth cookie
 */
export async function login(password: string): Promise<boolean> {
  const adminPassword = getAdminPassword();
  if (!adminPassword) {
    return false;
  }

  if (password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, adminPassword, {
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
  const adminPassword = getAdminPassword();
  if (!adminPassword) {
    return false;
  }

  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  return authCookie?.value === adminPassword;
}
