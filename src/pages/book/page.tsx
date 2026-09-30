import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { format } from "date-fns";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useLang } from "@/components/providers/lang.tsx";
import { useSettings } from "@/components/providers/settings.tsx";
import { formatTime12 } from "@/lib/format.ts";
import { cn } from "@/lib/utils.ts";

export default function BookPage() {
  const { t } = useLang();
  const s = useSettings();
  const create = useMutation(api.bookings.create);
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState("");
  const dateStr = date ? format(date, "yyyy-MM-dd") : "";
  const slots = useQuery(api.bookings.slots, dateStr ? { date: dateStr } : "skip");

  if (!s.flags.booking) return <p className="p-10 text-center">{t("Table booking is currently unavailable.", "حجز الطاولات غير متاح حاليًا.")}</p>;
  if (done) {
    return (
      <div className="mx-auto max-w-md space-y-3 p-10 text-center">
        <h1 className="text-2xl font-bold">{t("Booking received", "تم استلام الحجز")}</h1>
        <p className="text-4xl font-bold text-primary">{done}</p>
        <p className="text-muted-foreground">{t("We will confirm your table shortly.", "سنؤكد طاولتك قريبًا.")}</p>
      </div>
    );
  }

  const submit = async () => {
    try {
      const r = await create({ name, phone, date: dateStr, slot, guests, notes: notes || undefined });
      setDone(r.bookingNo);
    } catch (e) {
      toast.error(e instanceof ConvexError ? (e.data as { message: string }).message : t("Booking failed", "فشل الحجز"));
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-8 px-4 py-8 md:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{t("Book a Table", "احجز طاولة")}</h1>
        <Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); setSlot(""); }} disabled={{ before: new Date() }} className="rounded-lg border bg-card" />
      </div>
      <div className="space-y-4 md:pt-14">
        <div className="space-y-2">
          <Label>{t("Available times", "الأوقات المتاحة")}</Label>
          {!date ? <p className="text-sm text-muted-foreground">{t("Pick a date first.", "اختر التاريخ أولًا.")}</p>
            : slots === undefined ? <p className="text-sm">...</p>
            : slots.length === 0 ? <p className="text-sm text-muted-foreground">{t("No times available on this date.", "لا توجد أوقات متاحة.")}</p>
            : <div className="flex flex-wrap gap-2">{slots.map((x) => (
                <button key={x.slot} disabled={x.remaining < guests} onClick={() => setSlot(x.slot)} className={cn("cursor-pointer rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40", slot === x.slot ? "border-primary bg-primary text-primary-foreground" : "bg-card")}>{formatTime12(x.slot)}</button>
              ))}</div>}
        </div>
        <div className="space-y-2"><Label>{t("Name", "الاسم")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" /></div>
        <div className="space-y-2"><Label>{t("Phone", "الهاتف")}</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 50 123 4567" inputMode="tel" /></div>
        <div className="space-y-2"><Label>{t("Guests", "عدد الضيوف")}</Label><Input type="number" min={1} max={50} value={guests} onChange={(e) => setGuests(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>{t("Special request", "طلب خاص")}</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
        <Button className="w-full" size="lg" disabled={!slot || !name.trim() || !phone.trim() || guests < 1} onClick={() => void submit()}>{t("Book table", "احجز")}</Button>
      </div>
    </div>
  );
}
