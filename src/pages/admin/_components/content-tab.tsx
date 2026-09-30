import { useState } from 'react';
import { Image as ImageIcon, Phone, Type, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Settings } from '@/lib/db.ts';
import { updateSettings } from '@/lib/db.ts';
import { errMsg } from '@/lib/errors.ts';
import { Input } from '@/components/ui/input.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import ImageUpload from '@/components/image-upload.tsx';
import { useRefreshSettings, useSettings } from '@/components/providers/settings.tsx';
import { Field, Panel, SaveBar } from './admin-ui.tsx';

type Content = Settings['content'];
type TextKey = { [K in keyof Content]: Content[K] extends string ? K : never }[keyof Content];
type TextField = { key: TextKey; label: string; long?: boolean; rtl?: boolean; placeholder?: string };

// English and Arabic sit side by side so both are easy to keep in sync
const WEBSITE_TEXT: [TextField, TextField][] = [
  [{ key: 'heroTitleEn', label: 'Hero title' }, { key: 'heroTitleAr', label: 'Hero title (Arabic)', rtl: true }],
  [{ key: 'heroSubtitleEn', label: 'Hero subtitle', long: true }, { key: 'heroSubtitleAr', label: 'Hero subtitle (Arabic)', long: true, rtl: true }],
  [{ key: 'offerBannerEn', label: 'Offer banner' }, { key: 'offerBannerAr', label: 'Offer banner (Arabic)', rtl: true }],
  [{ key: 'aboutEn', label: 'About', long: true }, { key: 'aboutAr', label: 'About (Arabic)', long: true, rtl: true }],
];

const CONTACT: TextField[] = [
  { key: 'phone', label: 'Phone', placeholder: '+971 4 123 4567' },
  { key: 'whatsapp', label: 'WhatsApp number', placeholder: '971501234567' },
  { key: 'address', label: 'Address', placeholder: 'Karama, Dubai' },
  { key: 'openingHours', label: 'Opening hours text', placeholder: 'Daily 10am to 11pm' },
];

export default function ContentTab() {
  const current = useSettings();
  const refresh = useRefreshSettings();
  const [c, setC] = useState<Content>(current.content);
  const [saving, setSaving] = useState(false);

  const set = (key: TextKey, value: string) => setC({ ...c, [key]: value });

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings({ content: c });
      await refresh();
      toast.success('Content saved');
    } catch (e) {
      toast.error(errMsg(e, 'Could not save content'));
    } finally {
      setSaving(false);
    }
  };

  const input = (t: TextField) => (
    <Field key={t.key} label={t.label} htmlFor={`c-${t.key}`}>
      {t.long
        ? <Textarea id={`c-${t.key}`} dir={t.rtl ? 'rtl' : undefined} rows={3} value={c[t.key]} placeholder={t.placeholder} onChange={(e) => set(t.key, e.target.value)} />
        : <Input id={`c-${t.key}`} dir={t.rtl ? 'rtl' : undefined} value={c[t.key]} placeholder={t.placeholder} onChange={(e) => set(t.key, e.target.value)} />}
    </Field>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Panel icon={Type} title="Website text" description="Headlines and text customers see on the website">
        {WEBSITE_TEXT.map(([en, ar]) => (
          <div key={en.key} className="grid gap-4 md:grid-cols-2">{input(en)}{input(ar)}</div>
        ))}
      </Panel>

      <Panel icon={Phone} title="Contact details">
        <div className="grid gap-4 sm:grid-cols-2">{CONTACT.map(input)}</div>
      </Panel>

      <Panel icon={ImageIcon} title="Images">
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageRow label="Hero image" url={c.heroImage} onChange={(u) => setC({ ...c, heroImage: u })} />
          <ImageRow label="About image" url={c.aboutImage} onChange={(u) => setC({ ...c, aboutImage: u })} />
        </div>
        <Field label={`Gallery (${c.gallery.length})`}>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
            {c.gallery.map((u, i) => (
              <div key={`${u}-${i}`} className="group relative aspect-square overflow-hidden rounded-[var(--radius)] border">
                <img src={u} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  aria-label="Remove image"
                  className="absolute right-1 top-1 cursor-pointer rounded-full bg-destructive p-1 text-white shadow"
                  onClick={() => setC({ ...c, gallery: c.gallery.filter((_, k) => k !== i) })}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            <div className="flex aspect-square items-center justify-center rounded-[var(--radius)] border border-dashed">
              <ImageUpload label="Add" onUploaded={(u) => setC({ ...c, gallery: [...c.gallery, u] })} />
            </div>
          </div>
        </Field>
      </Panel>

      <SaveBar busy={saving} label="Save content" onSave={() => void save()} />
    </div>
  );
}

function ImageRow({ label, url, onChange }: { label: string; url: string; onChange: (u: string) => void }) {
  return (
    <Field label={label}>
      <div className="space-y-2">
        <div className="flex aspect-video items-center justify-center overflow-hidden rounded-[var(--radius)] border bg-muted">
          {url ? <img src={url} alt="" className="size-full object-cover" /> : <ImageIcon className="size-8 text-muted-foreground" />}
        </div>
        <ImageUpload label={url ? 'Replace image' : 'Upload image'} onUploaded={onChange} />
      </div>
    </Field>
  );
}
