// src/middleware/auth.ts
import { Context, Next } from "hono";
import { userDatabase, User } from "../services/userDatabase";

// Extend Context type to include user
declare module "hono" {
  interface Context {
    user?: User;
  }
}

// Helper function to get cookie
function getCookie(c: Context, name: string): string | undefined {
  const cookieHeader = c.req.header('Cookie');
  if (!cookieHeader) return undefined;
  
  const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie: string) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});
  
  return cookies[name];
}

export async function authMiddleware(c: Context, next: Next) {
  // Skip auth for login/register pages and static files
  const path = c.req.path;
  const publicPaths = [
    "/login",
    "/register",
    "/auth",
    "/public",
    "/css",
    "/js",
  ];

  if (publicPaths.some((p) => path.startsWith(p)) || path === "/") {
    return await next();
  }

  // ✅ FIXED: Use getCookie helper instead of c.req.cookie()
  const token =
    c.req.header("Authorization")?.replace("Bearer ", "") ||
    getCookie(c, "session_token");

  if (!token) {
    return c.json({ success: false, message: "Authentication required" }, 401);
  }

  const user = userDatabase.validateSession(token);
  if (!user) {
    return c.json(
      { success: false, message: "Invalid or expired session" },
      401
    );
  }

  // Add user to context
  c.user = user;
  return await next();
}

export function requireAuth(c: Context): User {
  if (!c.user) {
    throw new Error("User not authenticated");
  }
  return c.user;
}