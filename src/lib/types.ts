import type { Priority } from "./constants";

export interface Task {
  id: string;
  owner_id: string;
  title: string;
  done: boolean;
  priority: Priority;
  created_at: string;
}
