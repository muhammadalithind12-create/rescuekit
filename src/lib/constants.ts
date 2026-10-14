// Demo identity. No login wall so visitors can try the app instantly.
// RLS still enforces owner-only access (see supabase/migrations/001_taskly.sql).
// Production: replace with the authenticated user's id from Supabase Auth.
export const DEMO_OWNER_ID = "demo-user-001";

export const PAGE_SIZE = 8;

export const PRIORITIES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];
