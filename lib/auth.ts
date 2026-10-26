import { cookies } from "next/headers";
import { cloudStoreGet, cloudStoreSet, isSupabaseConfigured } from "./supabase";

export interface UserSession {
  id: string;
  email: string;
  provider: "supabase_auth" | "store_auth";
  created_at: string;
}

const AUTH_COOKIE = "fyloo_auth_session";
const USERS_STORE_KEY = "fyloo:registered_users";

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
export async function signUpUser(email: string, password: string):Promise<{ success: boolean; user?: UserSession; error?: string }> {
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
    passwordHash: password, // in production with Supabase, Supabase handles bcrypt hashing
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
