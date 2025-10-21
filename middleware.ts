// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Types for better type safety
interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    role: "admin" | "user" | "corporate" | "super_admin";
    permissions?: string[];
  };
  error?: string;
}

// Route configuration
const PROTECTED_ROUTES = {
  admin: ["/admin"],
  dashboard: ["/dashboard"],
} as const;

const REDIRECT_ROUTES = {
  login: "/auth",
  home: "/",
  dashboard: "/dashboard",
  unauthorized: "/unauthorized",
} as const;




export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value || "";
  
  
  
 
  if (!token) {
    console.log("[Middleware] No auth token found, redirecting to login");

    return createRedirectResponse(request, REDIRECT_ROUTES.login);
  }

  try {
    // Verify token with timeout and proper error handling
    const authResult = await verifyAuthToken(request, token);

    if (!authResult.success) {
      console.log("[Middleware] Token verification failed:", authResult.error);
      return createRedirectResponse(request, REDIRECT_ROUTES.login);
    }

    if (authResult.user?.role !== "super_admin") {
      // Role-based access control
      const accessResult = checkRouteAccess(pathname, authResult.user);
      if (!accessResult.allowed) {
        console.log(
          `[Middleware] Access denied for ${authResult.user?.role} to ${pathname}`
        );
        return createRedirectResponse(request, accessResult.redirectTo || "/");
      }

      if (pathname.startsWith("/auth")) {
        return createRedirectResponse(request, REDIRECT_ROUTES.dashboard);
      }
    }

    // Add user context to headers for downstream use
    const response = NextResponse.next();
    response.headers.set("x-user-id", authResult.user?.id || "");
    response.headers.set("x-user-role", authResult.user?.role || "");

    console.log(
      `[Middleware] Access granted for ${authResult.user?.role} to ${pathname}`
    );
    return response;
  } catch (error) {
    console.error("[Middleware] Authentication error:", error);

    // Different handling based on error type
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("[Middleware] Network error - auth service unavailable");
    }

    return createRedirectResponse(request, REDIRECT_ROUTES.login);
  }
}

async function verifyAuthToken(
  request: NextRequest,
  token: string
): Promise<AuthResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const verifyResponse = await fetch(
      `${request.nextUrl.origin}/api/auth/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
          "User-Agent": request.headers.get("user-agent") || "",
          "X-Forwarded-For": request.headers.get("x-forwarded-for") || "",
        },
        body: JSON.stringify({ token }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!verifyResponse.ok) {
      return {
        success: false,
        error: `HTTP ${verifyResponse.status}: ${verifyResponse.statusText}`,
      };
    }

    return await verifyResponse.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Authentication request timed out");
    }
    throw error;
  }
}

function checkRouteAccess(pathname: string, user?: AuthResult["user"]) {
  if (!user) {
    return { allowed: false, redirectTo: REDIRECT_ROUTES.login };
  }

  if (user.role === "user") {
    return { allowed: false, redirectTo: REDIRECT_ROUTES.unauthorized };
  }

  // Admin route access
  if (pathname.startsWith("/admin")) {
    if (user.role !== "admin") {
      return { allowed: false, redirectTo: REDIRECT_ROUTES.unauthorized };
    }
    return { allowed: true };
  }

  // Dashboard route access (allow both admin and regular users)
  if (pathname.startsWith("/dashboard")) {
    // You can add more granular permissions here if needed
    if (user.role === "admin" || user.role === "super_admin") {
      return { allowed: true };
    }
    return { allowed: false, redirectTo: REDIRECT_ROUTES.unauthorized };
  }

  return { allowed: true };
}

function createRedirectResponse(request: NextRequest, redirectPath: string) {
  const response = NextResponse.redirect(new URL(redirectPath, request.url));

  // Add security headers
  response.headers.set("X-Robots-Tag", "noindex");
  response.headers.set("Cache-Control", "no-store");

  return response;
}

// Enhanced matcher configuration
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile",
    // Add other protected routes as needed
  ],
  // Exclude static files and API routes from middleware
  unstable_allowDynamic: [
    "/api/**",
    "/_next/**",
    "/favicon.ico",
    "/robots.txt",
  ],
};


// // Simple empty middleware function used to bypass middleware processing
// export default function middleware() {
//   // Do nothing
//   return null
// }






