import { useState } from "react";
import { useMutation } from "convex/react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import ImageUpload from "@/components/image-upload.tsx";
import { useSettings, type Settings } from "@/components/providers/settings.tsx";

type Content = Settings["content"];
type TextKey = { [K in keyof Content]: Content[K] extends string ? K : never }[keyof Content];

const TEXTS: { key: TextKey; label: string; long?: boolean; rtl?: boolean }[] = [
  { key: "heroTitleEn", label: "Hero title (English)" },
  { key: "heroTitleAr", label: "Hero title (Arabic)", rtl: true },
  { key: "heroSubtitleEn", label: "Hero subtitle (English)", long: true },
  { key: "heroSubtitleAr", label: "Hero subtitle (Arabic)", long: true, rtl: true },
  { key: "offerBannerEn", label: "Offer banner (English)" },
  { key: "offerBannerAr", label: "Offer banner (Arabic)", rtl: true },
  { key: "aboutEn", label: "About (English)", long: true },
  { key: "aboutAr", label: "About (Arabic)", long: true, rtl: true },
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp number" },
  { key: "address", label: "Address" },
  { key: "openingHours", label: "Opening hours" },
];

export default function ContentTab() {
  const current = useSettings();
  const save = useMutation(api.settings.update);
  const [c, setC] = useState<Content>(current.content);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid gap-4">
        {TEXTS.map((t) => (
          <div key={t.key} className="space-y-1">
            <Label>{t.label}</Label>
            {t.long ? <Textarea dir={t.rtl ? "rtl" : undefined} rows={3} value={c[t.key]} onChange={(e) => setC({ ...c, [t.key]: e.target.value })} />
              : <Input dir={t.rtl ? "rtl" : undefined} value={c[t.key]} onChange={(e) => setC({ ...c, [t.key]: e.target.value })} />}
          </div>
        ))}
      </div>
      <ImageRow label="Hero image" url={c.heroImage} onChange={(u) => setC({ ...c, heroImage: u })} />
      <ImageRow label="About image" url={c.aboutImage} onChange={(u) => setC({ ...c, aboutImage: u })} />
      <div className="space-y-2">
        <Label>Gallery</Label>
        <div className="flex flex-wrap gap-2">
          {c.gallery.map((u, i) => (
            <div key={i} className="relative">
              <img src={u} alt="" className="size-20 rounded object-cover" />
              <button className="absolute -right-1 -top-1 cursor-pointer rounded-full bg-destructive p-0.5 text-white" onClick={() => setC({ ...c, gallery: c.gallery.filter((_, k) => k !== i) })}><X className="size-3" /></button>
            </div>
          ))}
        </div>
        <ImageUpload label="Add to gallery" onUploaded={(u) => setC({ ...c, gallery: [...c.gallery, u] })} />
      </div>
      <Button size="lg" onClick={async () => { await save({ values: { ...current, content: c } }); toast.success("Content saved"); }}>Save content</Button>
    </div>
  );
}

function ImageRow({ label, url, onChange }: { label: string; url: string; onChange: (u: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {url && <img src={url} alt="" className="h-16 w-28 rounded object-cover" />}
        <ImageUpload onUploaded={onChange} />
      </div>
    </div>
  );
}
