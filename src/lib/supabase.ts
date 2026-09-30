import { createClient } from '@supabase/supabase-js';

// Public keys — safe to include in client code
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL as string ||
  'https://tfurgfmievodfhthqikb.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY as string ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmdXJnZm1pZXZvZGZodGhxaWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MTIwODMsImV4cCI6MjEwNjI4ODA4M30.lsVUMve_8ukKd0RATwIy6CspmLBh__CjnPAkywyxYzA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { params: { eventsPerSecond: 10 } },
});

export type SupabaseClient = typeof supabase;
