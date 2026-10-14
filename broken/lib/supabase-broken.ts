// ❌ BROKEN (deliberate demo) — see docs/RESCUE-REPORT.md #1 and #8
//
// What's wrong here:
//   #1 — The SERVICE_ROLE key is hardcoded in source. This file is bundled
//        and shipped to every visitor's browser, so anyone can copy the key
//        and get FULL admin access to the database (bypasses RLS entirely).
//   #8 — The real secret was committed to git history, where it lives forever
//        even if you delete it later.

import { createClient } from "@supabase/supabase-js";

// ❌ Real project URL + full-privilege key, checked into the repo.
const SUPABASE_URL = "https://xyzcompany.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.REDACTED_DEMO_KEY";

export const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
