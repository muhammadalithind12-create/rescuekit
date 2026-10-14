import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Finding #1 fix: only the publishable anon key is ever used here, read from
// the environment at request time. The service_role key (if one exists) lives
// exclusively in server-only code paths and is NEVER bundled to the client.
export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — middleware handles session refresh.
        }
      },
    },
  });
}
