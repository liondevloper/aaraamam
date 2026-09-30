import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Category, MenuItem } from '@/lib/db.ts';
import { deleteCategory, deleteItem, listCategories, listItems, saveCategory, saveItem, setItemAvailable } from '@/lib/db.ts';
import { Button } from '@/components/ui/button.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import ImageUpload from '@/components/image-upload.tsx';

const slug = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

type CatForm = Partial<Category>;
type ItemForm = Partial<MenuItem>;

export default function MenuTab() {
  const [cats, setCats] = useState<Category[] | null>(null);
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [cat, setCat] = useState<CatForm | null>(null);
  const [item, setItem] = useState<ItemForm | null>(null);

  const load = () => {
    listCategories().then(setCats).catch(console.error);
    listItems().then(setItems).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  if (!cats || !items) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <Button onClick={() => setCat({ sort: cats.length, active: true })}><Plus className="size-4" />Add category</Button>
      {cats.map((c) => (
        <section key={c.id} className="rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="flex-1 font-bold">{c.name_en} {!c.active && <span className="text-xs text-muted-foreground">(hidden)</span>}</h3>
            <Button size="sm" variant="secondary" onClick={() => setItem({ category_id: c.id, available: true, popular: false, on_request: false, sort: 99 })}><Plus className="size-4" />Item</Button>
            <Button size="icon" variant="secondary" className="size-8" onClick={() => setCat(c)}><Pencil className="size-4" /></Button>
            <Button size="icon" variant="destructive" className="size-8" onClick={() => { if (confirm(`Delete ${c.name_en} and its items?`)) void deleteCategory(c.id).then(load); }}><Trash2 className="size-4" /></Button>
          </div>
          <div className="mt-3 divide-y">
            {items.filter((i) => i.category_id === c.id).map((i) => (
              <div key={i.id} className="flex items-center gap-3 py-2 text-sm">
                {i.image_url && <img src={i.image_url} alt="" className="size-10 rounded object-cover" />}
                <span className="flex-1">{i.name_en} <span className="text-muted-foreground">{i.on_request ? 'on request' : i.variants ? i.variants.map((v) => v.price).join(' / ') : i.price}</span></span>
                <Switch checked={i.available} onCheckedChange={(a) => void setItemAvailable(i.id, a).then(load)} aria-label="Available" />
                <Button size="icon" variant="secondary" className="size-8" onClick={() => setItem(i)}><Pencil className="size-4" /></Button>
                <Button size="icon" variant="destructive" className="size-8" onClick={() => void deleteItem(i.id).then(load)}><Trash2 className="size-4" /></Button>
              </div>
            ))}
          </div>
        </section>
      ))}
      {cat && <CategoryDialog cat={cat} onClose={() => { setCat(null); load(); }} />}
      {item && <ItemDialog item={item} onClose={() => { setItem(null); load(); }} />}
    </div>
  );
}

function CategoryDialog({ cat, onClose }: { cat: CatForm; onClose: () => void }) {
  const [f, setF] = useState(cat);
  const submit = async () => {
    if (!f.name_en?.trim()) return toast.error('Name is required');
    await saveCategory({ ...f, name_en: f.name_en, slug: f.slug || slug(f.name_en) });
    onClose();
  };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{f.id ? 'Edit' : 'New'} category</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label="Name"><Input value={f.name_en ?? ''} onChange={(e) => setF({ ...f, name_en: e.target.value })} /></Field>
          <Field label="Arabic name"><Input dir="rtl" value={f.name_ar ?? ''} onChange={(e) => setF({ ...f, name_ar: e.target.value })} /></Field>
          <Field label="Time label"><Input value={f.time_label ?? ''} onChange={(e) => setF({ ...f, time_label: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Available from"><Input type="time" value={f.available_from ?? ''} onChange={(e) => setF({ ...f, available_from: e.target.value })} /></Field>
            <Field label="Available to"><Input type="time" value={f.available_to ?? ''} onChange={(e) => setF({ ...f, available_to: e.target.value })} /></Field>
          </div>
          <Field label="Sort"><Input type="number" value={f.sort ?? 0} onChange={(e) => setF({ ...f, sort: Number(e.target.value) })} /></Field>
          <label className="flex items-center gap-2 text-sm"><Switch checked={f.active ?? true} onCheckedChange={(a) => setF({ ...f, active: a })} />Active</label>
          <Button onClick={() => void submit()}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ItemDialog({ item, onClose }: { item: ItemForm; onClose: () => void }) {
  const [f, setF] = useState(item);
  const two = (f.variants?.length ?? 0) > 0;
  const submit = async () => {
    if (!f.name_en?.trim() || !f.category_id) return toast.error('Name is required');
    await saveItem({ ...f, name_en: f.name_en, slug: f.slug || slug(f.name_en), category_id: f.category_id });
    onClose();
  };
  const setVariant = (i: number, price: number) =>
    setF({ ...f, variants: (f.variants ?? []).map((v, k) => (k === i ? { ...v, price } : v)) });
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-auto">
        <DialogHeader><DialogTitle>{f.id ? 'Edit' : 'New'} item</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label="Name"><Input value={f.name_en ?? ''} onChange={(e) => setF({ ...f, name_en: e.target.value })} /></Field>
          <Field label="Arabic name"><Input dir="rtl" value={f.name_ar ?? ''} onChange={(e) => setF({ ...f, name_ar: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={f.on_request ?? false} onCheckedChange={(c) => setF({ ...f, on_request: c === true })} />Price on request</label>
          {!f.on_request && (
            <>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={two} onCheckedChange={(c) => setF({ ...f, variants: c === true ? [{ label: 'Half', price: 0 }, { label: 'Full', price: 0 }] : undefined })} />Half / Full prices</label>
              {two ? (
                <div className="grid grid-cols-2 gap-3">
                  {f.variants?.map((v, i) => <Field key={v.label} label={v.label}><Input type="number" value={v.price} onChange={(e) => setVariant(i, Number(e.target.value))} /></Field>)}
                </div>
              ) : (
                <Field label="Price (AED)"><Input type="number" step="0.5" value={f.price ?? ''} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} /></Field>
              )}
            </>
          )}
          <div className="flex items-center gap-3">
            {f.image_url && <img src={f.image_url} alt="" className="size-14 rounded object-cover" />}
            <ImageUpload onUploaded={(url) => setF({ ...f, image_url: url })} />
            {f.image_url && <Button size="sm" variant="secondary" onClick={() => setF({ ...f, image_url: undefined })}>Remove</Button>}
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
