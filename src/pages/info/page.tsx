import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import PageHeading from "@/components/page-heading.tsx";
import { useLang } from "@/components/providers/lang.tsx";
import { useSettings } from "@/components/providers/settings.tsx";
import { getLook } from "@/lib/theme-look.ts";
import { cn } from "@/lib/utils.ts";

export function GalleryPage() {
  const { t } = useLang();
  const { content, theme } = useSettings();
  const look = getLook(theme);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeading>{t("Gallery", "المعرض")}</PageHeading>
      <div className={look.gallery}>
        {content.gallery.map((src, i) => <img key={i} src={src} alt="" loading="lazy" className={cn("w-full object-cover", look.gallery.includes("aspect") ? "" : look.photo)} />)}
      </div>
    </div>
  );
}

export function AboutPage() {
  const { t } = useLang();
  const { content, theme } = useSettings();
  const look = getLook(theme);
  const centered = look.head.includes("text-center");
  return (
    <div className={cn("mx-auto max-w-5xl items-center gap-8 px-4 py-8", centered ? "max-w-3xl space-y-8" : "grid md:grid-cols-2")}>
      <div className="space-y-4">
        <PageHeading className="mb-2">{t("About us", "من نحن")}</PageHeading>
        <p className={cn("whitespace-pre-line text-muted-foreground", centered && "text-center")}>{t(content.aboutEn, content.aboutAr)}</p>
      </div>
      <img src={content.aboutImage} alt="" className={cn("w-full object-cover", centered ? "aspect-[3/4] max-h-[28rem] rounded-t-full" : "aspect-[4/3]", !centered && look.photo)} />
    </div>
  );
}

export function ContactPage() {
  const { t } = useLang();
  const { content, delivery, theme } = useSettings();
  const look = getLook(theme);
  const { lat, lng } = delivery;
  const bbox = `${lng - 0.008},${lat - 0.005},${lng + 0.008},${lat + 0.005}`;
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2">
      <div className={cn("space-y-4", look.panel)}>
        <PageHeading className="mb-2">{t("Contact", "اتصل بنا")}</PageHeading>
        <p>{content.address || t("Karama, Dubai", "الكرامة، دبي")}</p>
        {content.openingHours && <p className="text-muted-foreground">{content.openingHours}</p>}
        <div className="flex flex-wrap gap-2">
          {content.phone && <Button asChild variant="secondary"><a href={`tel:${content.phone}`}><Phone className="size-4" />{content.phone}</a></Button>}
          {content.whatsapp && <Button asChild><a href={`https://wa.me/${content.whatsapp.replace(/\D/g, "")}`}><MessageCircle className="size-4" />WhatsApp</a></Button>}
        </div>
      </div>
      <iframe title="Map" className={cn("h-72 w-full border", look.photo)} src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`} />
    </div>
  );
}
