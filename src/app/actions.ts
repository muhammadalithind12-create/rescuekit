"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createTaskSchema } from "@/lib/validations";
import { DEMO_OWNER_ID } from "@/lib/constants";

export interface ActionState {
  ok: boolean;
  error: string | null;
  fieldErrors?: Record<string, string[]>;
}

const initialState: ActionState = { ok: false, error: null };

// Findings #5 + #6 fix: validate first, catch everything, never white-screen.
export async function createTask(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    priority: formData.get("priority") ?? "medium",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const supabase = await createClient();
    // Finding #10 fix: every write carries ownership — RLS enforces it too.
    const { error } = await supabase.from("rk_tasks").insert({
      owner_id: DEMO_OWNER_ID,
      title: parsed.data.title,
      priority: parsed.data.priority,
    });
    if (error) throw error;
  } catch {
    return {
      ok: false,
      error: "Could not save the task. Please check your connection and try again.",
    };
  }

  revalidatePath("/");
  return { ok: true, error: null };
}

export async function toggleTask(
  id: string,
  done: boolean
): Promise<{ ok: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("rk_tasks")
      .update({ done })
      .eq("id", id)
      .eq("owner_id", DEMO_OWNER_ID); // belt & suspenders: app-level + RLS
    if (error) throw error;
  } catch {
    return { ok: false, error: "Could not update the task. Please try again." };
  }
  revalidatePath("/");
  return { ok: true, error: null };
}

export async function deleteTask(
  id: string
): Promise<{ ok: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("rk_tasks")
      .delete()
      .eq("id", id)
      .eq("owner_id", DEMO_OWNER_ID);
    if (error) throw error;
  } catch {
    return { ok: false, error: "Could not delete the task. Please try again." };
  }
  revalidatePath("/");
  return { ok: true, error: null };
}

export { initialState };
