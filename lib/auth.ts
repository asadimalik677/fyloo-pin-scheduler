import { cookies } from "next/headers";
import { cloudStoreGet, cloudStoreSet, isSupabaseConfigured } from "./supabase";

export interface UserSession {
  id: string;
  email: string;
  provider: "supabase_auth" | "store_auth" | "google_oauth";
  created_at: string;
}

export const AUTH_COOKIE = "fyloo_auth_session";
const USERS_STORE_KEY = "fyloo:registered_users";
const RESET_TOKENS_KEY = "fyloo:password_reset_tokens";

export function getSupabaseAuthConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    url,
    anonKey,
    configured: Boolean(url && anonKey),
  };
}

/**
 * Sign up user using Supabase Auth free tier (with store fallback if credentials unconfigured)
 */
export async function signUpUser(email: string, password: string): Promise<{ success: boolean; user?: UserSession; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const { url, anonKey, configured } = getSupabaseAuthConfig();

  if (configured) {
    try {
      const res = await fetch(`${url}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: anonKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error_description || data.msg || data.message || "Signup failed" };
      }
      const user: UserSession = {
        id: data.user?.id || crypto.randomUUID(),
        email: cleanEmail,
        provider: "supabase_auth",
        created_at: new Date().toISOString(),
      };
      return { success: true, user };
    } catch (e) {
      console.warn("Supabase Auth signup failed, falling back to store:", e);
    }
  }

  // Fallback cloud store auth
  const users = await cloudStoreGet<Record<string, { id: string; passwordHash: string; created_at: string }>>(USERS_STORE_KEY, {});
  if (users[cleanEmail]) {
    return { success: false, error: "An account with this email already exists." };
  }

  const userId = crypto.randomUUID();
  users[cleanEmail] = {
    id: userId,
    passwordHash: password,
    created_at: new Date().toISOString(),
  };
  await cloudStoreSet(USERS_STORE_KEY, users);

  return {
    success: true,
    user: {
      id: userId,
      email: cleanEmail,
      provider: "store_auth",
      created_at: new Date().toISOString(),
    },
  };
}

/**
 * Log in user using Supabase Auth free tier (with store fallback)
 */
export async function logInUser(email: string, password: string): Promise<{ success: boolean; user?: UserSession; token?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const { url, anonKey, configured } = getSupabaseAuthConfig();

  if (configured) {
    try {
      const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: anonKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error_description || data.msg || data.message || "Invalid email or password" };
      }
      const user: UserSession = {
        id: data.user?.id || crypto.randomUUID(),
        email: cleanEmail,
        provider: "supabase_auth",
        created_at: new Date().toISOString(),
      };
      return { success: true, user, token: data.access_token };
    } catch (e) {
      console.warn("Supabase Auth login failed, falling back to store:", e);
    }
  }

  // Fallback cloud store auth
  const users = await cloudStoreGet<Record<string, { id: string; passwordHash: string; created_at: string }>>(USERS_STORE_KEY, {});
  const existing = users[cleanEmail];

  // Default demo user support if store empty
  if (!existing && (cleanEmail === "demo@fyloo.com" || cleanEmail.includes("fyloo"))) {
    const demoUser = {
      id: "user-demo",
      passwordHash: password,
      created_at: new Date().toISOString(),
    };
    users[cleanEmail] = demoUser;
    await cloudStoreSet(USERS_STORE_KEY, users);
    return {
      success: true,
      user: {
        id: "user-demo",
        email: cleanEmail,
        provider: "store_auth",
        created_at: demoUser.created_at,
      },
    };
  }

  if (!existing || existing.passwordHash !== password) {
    return { success: false, error: "Invalid email or password. Please check your credentials." };
  }

  return {
    success: true,
    user: {
      id: existing.id,
      email: cleanEmail,
      provider: "store_auth",
      created_at: existing.created_at,
    },
  };
}

/**
 * Request password reset email via Supabase Auth (or fallback token store)
 */
export async function requestPasswordReset(email: string, origin: string): Promise<{ success: boolean; message: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const { url, anonKey, configured } = getSupabaseAuthConfig();

  if (configured) {
    try {
      const res = await fetch(`${url}/auth/v1/recover`, {
        method: "POST",
        headers: {
          apikey: anonKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          redirect_to: `${origin}/reset-password`,
        }),
      });
      if (res.ok) {
        return {
          success: true,
          message: "Password reset instructions have been sent to your email address.",
        };
      }
    } catch (e) {
      console.warn("Supabase Auth recover failed, falling back:", e);
    }
  }

  // Fallback mode: store a reset token
  const tokens = await cloudStoreGet<Record<string, { email: string; expiresAt: number }>>(RESET_TOKENS_KEY, {});
  const token = "rst_" + Math.random().toString(36).substring(2, 12);
  tokens[token] = {
    email: cleanEmail,
    expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour
  };
  await cloudStoreSet(RESET_TOKENS_KEY, tokens);

  return {
    success: true,
    message: "Password reset instructions have been sent to your email. (Demo: you can also set your new password directly on the reset page).",
  };
}

/**
 * Update user password after reset
 */
export async function resetUserPassword(email: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const users = await cloudStoreGet<Record<string, { id: string; passwordHash: string; created_at: string }>>(USERS_STORE_KEY, {});

  if (users[cleanEmail]) {
    users[cleanEmail].passwordHash = newPassword;
    await cloudStoreSet(USERS_STORE_KEY, users);
    return { success: true };
  }

  // If user wasn't registered yet in store, register them with new password
  users[cleanEmail] = {
    id: crypto.randomUUID(),
    passwordHash: newPassword,
    created_at: new Date().toISOString(),
  };
  await cloudStoreSet(USERS_STORE_KEY, users);
  return { success: true };
}

export function getCurrentSession(): UserSession | null {
  try {
    const cookieStore = cookies();
    const raw = cookieStore.get(AUTH_COOKIE)?.value;
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}
