import { useLang } from '@/components/providers/lang.tsx';
import { useNow, useSettings } from '@/components/providers/settings.tsx';
import { formatDubai, getStoreStatus } from '@/lib/store.ts';

/** Live open / closed / maintenance state plus customer-facing text. Re-evaluates every 30s. */
export function useStoreStatus() {
  const s = useSettings();
  const { t, lang } = useLang();
  const now = useNow();
  const status = getStoreStatus(s, now);

  let headline = '';
  let detail = '';
  if (status.kind === 'closed') {
    headline = status.reason === 'ordering_off'
      ? t('Online ordering is paused', 'الطلب عبر الإنترنت متوقف مؤقتًا')
      : t("We're closed right now", 'نحن مغلقون الآن');
    const when = status.reopensAt
      ? t(`Opens ${formatDubai(status.reopensAt, 'en', now)}`, `نفتح ${formatDubai(status.reopensAt, 'ar', now)}`)
      : '';
    const note = status.reason === 'shift' ? t(s.store.closedNoteEn, s.store.closedNoteAr) : '';
    detail = [when, note].filter(Boolean).join(' · ');
  }

  return { status, canOrder: status.kind === 'open', headline, detail, now };
}
