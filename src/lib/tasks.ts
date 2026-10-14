import { createClient } from "./supabase/server";
import { DEMO_OWNER_ID, PAGE_SIZE } from "./constants";
import type { Task } from "./types";

export interface TaskQuery {
  q: string;
  priority: string; // "all" | "low" | "medium" | "high"
  page: number;
}

// Finding #9 fix: bounded, paginated queries — never an unbounded select("*").
export async function getTasks({ q, priority, page }: TaskQuery): Promise<{
  tasks: Task[];
  total: number;
}> {
  const supabase = await createClient();

  let query = supabase
    .from("rk_tasks")
    .select("*", { count: "exact" })
    .eq("owner_id", DEMO_OWNER_ID);

  if (q) {
    // ilike with escaped wildcards is safe: PostgREST parameterizes the value.
    const safe = q.replace(/[%_]/g, (c) => `\\${c}`);
    query = query.ilike("title", `%${safe}%`);
  }
  if (priority !== "all") {
    query = query.eq("priority", priority);
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (error) {
    throw new Error(`Failed to load tasks: ${error.message}`);
  }

  return { tasks: (data ?? []) as Task[], total: count ?? 0 };
}
