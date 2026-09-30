import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export default function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-bold", className)}>
      <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Leaf className="size-5" />
      </span>
    </span>
  );
}
