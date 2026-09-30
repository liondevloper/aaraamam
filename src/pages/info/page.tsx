import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useLang } from "@/components/providers/lang.tsx";
import { useSettings } from "@/components/providers/settings.tsx";

export function GalleryPage() {
  const { t } = useLang();
  const { content } = useSettings();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{t("Gallery", "المعرض")}</h1>
      <div className="columns-2 gap-3 md:columns-3">
        {content.gallery.map((src, i) => <img key={i} src={src} alt="" loading="lazy" className="mb-3 w-full rounded-lg object-cover" />)}
      </div>
    </div>
  );
}

export function AboutPage() {
  const { t } = useLang();
  const { content } = useSettings();
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-8 md:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{t("About us", "من نحن")}</h1>
        <p className="whitespace-pre-line text-muted-foreground">{t(content.aboutEn, content.aboutAr)}</p>
      </div>
      <img src={content.aboutImage} alt="" className="aspect-[4/3] w-full rounded-[var(--radius)] object-cover" />
    </div>
  );
}

export function ContactPage() {
  const { t } = useLang();
  const { content, delivery } = useSettings();
  const { lat, lng } = delivery;
  const bbox = `${lng - 0.008},${lat - 0.005},${lng + 0.008},${lat + 0.005}`;
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{t("Contact", "اتصل بنا")}</h1>
        <p>{content.address || t("Karama, Dubai", "الكرامة، دبي")}</p>
        {content.openingHours && <p className="text-muted-foreground">{content.openingHours}</p>}
        <div className="flex flex-wrap gap-2">
          {content.phone && <Button asChild variant="secondary"><a href={`tel:${content.phone}`}><Phone className="size-4" />{content.phone}</a></Button>}
          {content.whatsapp && <Button asChild><a href={`https://wa.me/${content.whatsapp.replace(/\D/g, "")}`}><MessageCircle className="size-4" />WhatsApp</a></Button>}
        </div>
      </div>
      <iframe title="Map" className="h-72 w-full rounded-lg border" src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`} />
    </div>
  );
}
