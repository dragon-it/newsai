# Supabase setup

1. Create a free Supabase project.
2. Open **SQL Editor**, paste all of [`db/schema.sql`](../db/schema.sql), and run it once.
3. Copy the Project URL and Secret API key from project settings.
4. Add `SUPABASE_URL` and `SUPABASE_SECRET_KEY` under **GitHub repository → Settings → Secrets and variables → Actions**.
5. For local execution, put the same names in `.env`.

The tables use Row Level Security and deny browser roles. The secret key is only
for GitHub Actions or local server-side execution; never put it in React code.

The workflow stores each daily report transactionally, exports the latest ten
reports to a temporary `data.json`, and deploys the static dashboard. Remove
existing tracked report files only after their data is imported and verified.
