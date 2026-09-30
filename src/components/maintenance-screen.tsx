import { Link } from 'react-router-dom';
import { MessageCircle, Phone, Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button.tsx';
import { useLang } from '@/components/providers/lang.tsx';
import { useSettings } from '@/components/providers/settings.tsx';

export default function MaintenanceScreen() {
  const s = useSettings();
  const { t } = useLang();
  const { phone, whatsapp } = s.content;
  const message = t(s.store.maintenanceEn, s.store.maintenanceAr);

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-6">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md space-y-6 text-center"
      >
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Wrench className="size-8" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{s.restaurant_name}</p>
          <h1 className="text-balance text-3xl font-bold">{t('We will be back soon', 'سنعود قريبًا')}</h1>
          {message && <p className="text-muted-foreground">{message}</p>}
        </div>
        {(phone || whatsapp) && (
          <div className="flex flex-wrap justify-center gap-2">
            {phone && (
              <Button asChild variant="secondary">
                <a href={`tel:${phone}`}><Phone className="size-4" />{t('Call us', 'اتصل بنا')}</a>
              </Button>
            )}
            {whatsapp && (
              <Button asChild>
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><MessageCircle className="size-4" />WhatsApp</a>
              </Button>
            )}
          </div>
        )}
        <Link to="/admin" className="block text-xs text-muted-foreground hover:underline">{t('Staff login', 'دخول الموظفين')}</Link>
      </motion.div>
    </div>
  );
}
