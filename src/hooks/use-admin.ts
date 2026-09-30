import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";

// Returns undefined while loading.
export function useAdminStatus() {
  return useQuery(api.admin.status, {});
}
