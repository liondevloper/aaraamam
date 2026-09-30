import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import ImageUpload from "@/components/image-upload.tsx";

type Cat = Doc<"categories">;
type Item = Doc<"menuItems">;
const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function MenuTab() {
  const cats = useQuery(api.menu.listCategories, {});
  const items = useQuery(api.menu.listItems, {});
  const [cat, setCat] = useState<Partial<Cat> | null>(null);
  const [item, setItem] = useState<Partial<Item> | null>(null);
  const setAvail = useMutation(api.menu.setAvailable);
  const delCat = useMutation(api.menu.deleteCategory);
  const delItem = useMutation(api.menu.deleteItem);
  if (!cats || !items) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <Button onClick={() => setCat({ sort: cats.length, active: true })}><Plus className="size-4" />Add category</Button>
      {cats.map((c) => (
        <section key={c._id} className="rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="flex-1 font-bold">{c.nameEn} {!c.active && <span className="text-xs text-muted-foreground">(hidden)</span>}</h3>
            <Button size="sm" variant="secondary" onClick={() => setItem({ categoryId: c._id, available: true, popular: false, onRequest: false, sort: 99 })}><Plus className="size-4" />Item</Button>
            <Button size="icon" variant="secondary" className="size-8" onClick={() => setCat(c)}><Pencil className="size-4" /></Button>
            <Button size="icon" variant="destructive" className="size-8" onClick={() => { if (confirm(`Delete ${c.nameEn} and its items?`)) void delCat({ id: c._id }); }}><Trash2 className="size-4" /></Button>
          </div>
          <div className="mt-3 divide-y">
            {items.filter((i) => i.categoryId === c._id).map((i) => (
              <div key={i._id} className="flex items-center gap-3 py-2 text-sm">
                {i.imageUrl && <img src={i.imageUrl} alt="" className="size-10 rounded object-cover" />}
                <span className="flex-1">{i.nameEn} <span className="text-muted-foreground">{i.onRequest ? "on request" : i.variants ? i.variants.map((v) => v.price).join(" / ") : i.price}</span></span>
                <Switch checked={i.available} onCheckedChange={(a) => void setAvail({ id: i._id, available: a })} aria-label="Available" />
                <Button size="icon" variant="secondary" className="size-8" onClick={() => setItem(i)}><Pencil className="size-4" /></Button>
                <Button size="icon" variant="destructive" className="size-8" onClick={() => void delItem({ id: i._id })}><Trash2 className="size-4" /></Button>
              </div>
            ))}
          </div>
        </section>
      ))}
      {cat && <CategoryDialog cat={cat} onClose={() => setCat(null)} />}
      {item && <ItemDialog item={item} onClose={() => setItem(null)} />}
    </div>
  );
}

function CategoryDialog({ cat, onClose }: { cat: Partial<Cat>; onClose: () => void }) {
  const save = useMutation(api.menu.saveCategory);
  const [f, setF] = useState(cat);
  const submit = async () => {
    if (!f.nameEn?.trim()) return toast.error("Name is required");
    await save({
      id: f._id, slug: f.slug || slug(f.nameEn), nameEn: f.nameEn, nameAr: f.nameAr || undefined,
      timeLabel: f.timeLabel || undefined, availableFrom: f.availableFrom || undefined, availableTo: f.availableTo || undefined,
      sort: f.sort ?? 0, active: f.active ?? true,
    });
    onClose();
  };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{f._id ? "Edit" : "New"} category</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label="Name"><Input value={f.nameEn ?? ""} onChange={(e) => setF({ ...f, nameEn: e.target.value })} /></Field>
          <Field label="Arabic name"><Input dir="rtl" value={f.nameAr ?? ""} onChange={(e) => setF({ ...f, nameAr: e.target.value })} /></Field>
          <Field label="Time label (e.g. 12:00pm – 4:00pm)"><Input value={f.timeLabel ?? ""} onChange={(e) => setF({ ...f, timeLabel: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Available from"><Input type="time" value={f.availableFrom ?? ""} onChange={(e) => setF({ ...f, availableFrom: e.target.value })} /></Field>
            <Field label="Available to"><Input type="time" value={f.availableTo ?? ""} onChange={(e) => setF({ ...f, availableTo: e.target.value })} /></Field>
          </div>
          <Field label="Sort"><Input type="number" value={f.sort ?? 0} onChange={(e) => setF({ ...f, sort: Number(e.target.value) })} /></Field>
          <label className="flex items-center gap-2 text-sm"><Switch checked={f.active ?? true} onCheckedChange={(a) => setF({ ...f, active: a })} />Active</label>
          <Button onClick={() => void submit()}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ItemDialog({ item, onClose }: { item: Partial<Item>; onClose: () => void }) {
  const save = useMutation(api.menu.saveItem);
  const [f, setF] = useState(item);
  const two = (f.variants?.length ?? 0) > 0;
  const submit = async () => {
    if (!f.nameEn?.trim() || !f.categoryId) return toast.error("Name is required");
    await save({
      id: f._id, slug: f.slug || slug(f.nameEn), categoryId: f.categoryId, nameEn: f.nameEn, nameAr: f.nameAr || undefined,
      descriptionEn: f.descriptionEn || undefined, price: two || f.onRequest ? undefined : f.price ?? 0,
      variants: two ? f.variants : undefined, onRequest: f.onRequest ?? false, imageUrl: f.imageUrl || undefined,
      available: f.available ?? true, popular: f.popular ?? false, sort: f.sort ?? 0,
    });
    onClose();
  };
  const setVariant = (i: number, price: number) =>
    setF({ ...f, variants: (f.variants ?? []).map((v, k) => (k === i ? { ...v, price } : v)) });
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-auto">
        <DialogHeader><DialogTitle>{f._id ? "Edit" : "New"} item</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label="Name"><Input value={f.nameEn ?? ""} onChange={(e) => setF({ ...f, nameEn: e.target.value })} /></Field>
          <Field label="Arabic name"><Input dir="rtl" value={f.nameAr ?? ""} onChange={(e) => setF({ ...f, nameAr: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={f.onRequest ?? false} onCheckedChange={(c) => setF({ ...f, onRequest: c === true })} />Price on request</label>
          {!f.onRequest && (
            <>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={two} onCheckedChange={(c) => setF({ ...f, variants: c === true ? [{ label: "Half", price: 0 }, { label: "Full", price: 0 }] : undefined })} />Half / Full prices</label>
              {two ? (
                <div className="grid grid-cols-2 gap-3">
                  {f.variants?.map((v, i) => <Field key={v.label} label={v.label}><Input type="number" value={v.price} onChange={(e) => setVariant(i, Number(e.target.value))} /></Field>)}
                </div>
              ) : (
                <Field label="Price (AED)"><Input type="number" step="0.5" value={f.price ?? ""} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} /></Field>
              )}
            </>
          )}
          <div className="flex items-center gap-3">
            {f.imageUrl && <img src={f.imageUrl} alt="" className="size-14 rounded object-cover" />}
            <ImageUpload onUploaded={(url) => setF({ ...f, imageUrl: url })} />
            {f.imageUrl && <Button size="sm" variant="secondary" onClick={() => setF({ ...f, imageUrl: undefined })}>Remove</Button>}
          </div>
          <label className="flex items-center gap-2 text-sm"><Switch checked={f.available ?? true} onCheckedChange={(a) => setF({ ...f, available: a })} />Available</label>
          <label className="flex items-center gap-2 text-sm"><Switch checked={f.popular ?? false} onCheckedChange={(a) => setF({ ...f, popular: a })} />Popular (shown on Home)</label>
          <Button onClick={() => void submit()}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}
