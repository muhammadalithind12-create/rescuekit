// ❌ BROKEN (deliberate demo) — see docs/RESCUE-REPORT.md #3
//
// What's wrong here:
//   #3 — This is a fake login. There is no password check, no server
//        verification, no session. It trusts whatever the browser claims.
//        Anyone can open DevTools and type:
//          localStorage.setItem("taskly_user", JSON.stringify({ name: "boss", role: "admin" }))
//        …and they are "logged in" as an admin.

export interface BrokenUser {
  name: string;
  role: "admin" | "member";
}

export function login(username: string): void {
  // ❌ No password. No server round-trip. Just vibes.
  localStorage.setItem(
    "taskly_user",
    JSON.stringify({ name: username, role: "admin" satisfies BrokenUser["role"] })
  );
}

export function currentUser(): BrokenUser | null {
  // ❌ The client is the authority on who you are. It isn't.
  const raw = localStorage.getItem("taskly_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BrokenUser;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem("taskly_user");
}
