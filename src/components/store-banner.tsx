import { Clock } from 'lucide-react';
import { useStoreStatus } from '@/hooks/use-store-status.ts';

// Thin notice across the site while the kitchen is not taking orders
export default function StoreBanner() {
  const { status, headline, detail } = useStoreStatus();
  if (status.kind !== 'closed') return null;
  return (
    <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-2.5 text-center text-sm">
      <span className="inline-flex items-center gap-2 font-semibold text-destructive">
        <Clock className="size-4" />
        {headline}
      </span>
      {detail && <span className="text-foreground/80"> · {detail}</span>}
    </div>
  );
}
