import { useCallback, useEffect, useState } from 'react';
import { ImageOff, Pencil, Plus, Search, Trash2, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import type { Category, MenuChannel, MenuItem } from '@/lib/db.ts';
import { deleteCategory, deleteItem, listCategories, listItems, saveCategory, saveItem, setItemAvailable } from '@/lib/db.ts';
import { errMsg } from '@/lib/errors.ts';
import { money } from '@/lib/format.ts';
import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import ImageUpload from '@/components/image-upload.tsx';
import { ConfirmDialog, type ConfirmRequest, EmptyBox, Field, LoadingList, Segmented } from './admin-ui.tsx';

const slug = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const CHANNELS: { id: MenuChannel; label: string }[] = [
  { id: 'dine_in', label: 'Table' },
  { id: 'delivery', label: 'Home' },
];

type CatForm = Partial<Category>;
type ItemForm = Partial<MenuItem>;
type Filter = 'all' | MenuChannel;

const priceText = (i: MenuItem) =>
  i.on_request ? 'On request' : i.variants?.length ? i.variants.map((v) => `${v.label} ${v.price}`).join(' / ') : i.price !== null ? money(i.price) : '-';

export default function MenuTab() {
  const [cats, setCats] = useState<Category[] | null>(null);
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [cat, setCat] = useState<CatForm | null>(null);
  const [item, setItem] = useState<ItemForm | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);

  const load = useCallback(() => {
    listCategories().then(setCats).catch((e: unknown) => { toast.error(errMsg(e)); setCats((c) => c ?? []); });
    listItems().then(setItems).catch((e: unknown) => { toast.error(errMsg(e)); setItems((i) => i ?? []); });
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!cats || !items) return <LoadingList count={4} className="h-32" />;

  const run = (p: Promise<void>) => p.then(load).catch((e: unknown) => { toast.error(errMsg(e)); });
  const term = q.trim().toLowerCase();
  const matches = (i: MenuItem) =>
    (filter === 'all' || (i.channels ?? []).includes(filter)) && (!term || i.name_en.toLowerCase().includes(term) || (i.name_ar ?? '').includes(term));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search dishes" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[{ id: 'all', label: 'All dishes' }, { id: 'dine_in', label: 'Table menu' }, { id: 'delivery', label: 'Home menu' }]}
        />
        <Button className="sm:ml-auto" onClick={() => setCat({ sort: cats.length, active: true })}><Plus className="size-4" />Add category</Button>
      </div>

      {cats.length === 0 && (
        <EmptyBox icon={UtensilsCrossed} title="No categories yet" description="Create a category like Breakfast or Biryani, then add dishes to it.">
          <Button size="sm" onClick={() => setCat({ sort: 0, active: true })}><Plus className="size-4" />Add category</Button>
        </EmptyBox>
      )}

      {cats.map((c) => {
        const list = items.filter((i) => i.category_id === c.id && matches(i));
        if (term && list.length === 0) return null;
        return (
          <section key={c.id} className="overflow-hidden rounded-[calc(var(--radius)+4px)] border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 px-4 py-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold">{c.name_en}{!c.active && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Hidden</span>}</h3>
                <p className="text-xs text-muted-foreground">{list.length} dish{list.length === 1 ? '' : 'es'}{c.time_label ? ` · ${c.time_label}` : ''}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setItem({ category_id: c.id, available: true, popular: false, on_request: false, sort: 99, channels: ['dine_in', 'delivery'] })}><Plus className="size-4" />Dish</Button>
              <Button size="icon" variant="ghost" className="size-8" aria-label="Edit category" onClick={() => setCat(c)}><Pencil className="size-4" /></Button>
              <Button size="icon" variant="ghost" className="size-8 text-destructive hover:text-destructive" aria-label="Delete category" onClick={() => setConfirm({ title: `Delete ${c.name_en}?`, description: 'The category and all of its dishes will be removed.', label: 'Delete', run: () => run(deleteCategory(c.id)) })}><Trash2 className="size-4" /></Button>
            </div>
            {list.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No dishes in this category{filter !== 'all' ? ' for this menu' : ''}.</p>
            ) : (
              <div className="divide-y">
                {list.map((i) => (
                  <div key={i.id} className={cn('flex items-center gap-3 px-4 py-3', !i.available && 'opacity-60')}>
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius)] bg-muted">
                      {i.image_url ? <img src={i.image_url} alt="" className="size-full object-cover" /> : <ImageOff className="size-4 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{i.name_en}{i.popular && <span className="ml-2 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">Popular</span>}</p>
                      <p className="truncate text-xs text-muted-foreground">{priceText(i)}</p>
                      <div className="mt-1 flex gap-1">
                        {CHANNELS.map((ch) => {
                          const on = (i.channels ?? []).includes(ch.id);
                          return <span key={ch.id} className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold', on ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground line-through opacity-60')}>{ch.label}</span>;
                        })}
                      </div>
                    </div>
                    <label className="flex flex-col items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Switch checked={i.available} onCheckedChange={(a) => void run(setItemAvailable(i.id, a))} aria-label="Available" />
                      {i.available ? 'In stock' : 'Sold out'}
                    </label>
                    <Button size="icon" variant="ghost" className="size-8" aria-label="Edit dish" onClick={() => setItem(i)}><Pencil className="size-4" /></Button>
                    <Button size="icon" variant="ghost" className="hidden size-8 text-destructive hover:text-destructive sm:inline-flex" aria-label="Delete dish" onClick={() => setConfirm({ title: `Delete ${i.name_en}?`, label: 'Delete', run: () => run(deleteItem(i.id)) })}><Trash2 className="size-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {cat && <CategoryDialog cat={cat} onClose={() => { setCat(null); load(); }} />}
      {item && <ItemDialog item={item} onDelete={item.id ? () => { const id = item.id ?? ''; const name = item.name_en ?? 'dish'; setItem(null); setConfirm({ title: `Delete ${name}?`, label: 'Delete', run: () => run(deleteItem(id)) }); } : undefined} onClose={() => { setItem(null); load(); }} />}
      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}

function CategoryDialog({ cat, onClose }: { cat: CatForm; onClose: () => void }) {
  const [f, setF] = useState(cat);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!f.name_en?.trim()) return toast.error('Name is required');
    setBusy(true);
    try {
      await saveCategory({ ...f, name_en: f.name_en, slug: f.slug || slug(f.name_en) });
      toast.success('Category saved');
      onClose();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-auto">
        <DialogHeader><DialogTitle>{f.id ? 'Edit' : 'New'} category</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><Input value={f.name_en ?? ''} placeholder="Breakfast" onChange={(e) => setF({ ...f, name_en: e.target.value })} /></Field>
            <Field label="Arabic name"><Input dir="rtl" value={f.name_ar ?? ''} onChange={(e) => setF({ ...f, name_ar: e.target.value })} /></Field>
          </div>
          <Field label="Time label" hint="Shown next to the category, e.g. 7am to 11am"><Input value={f.time_label ?? ''} onChange={(e) => setF({ ...f, time_label: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Available from"><Input type="time" value={f.available_from ?? ''} onChange={(e) => setF({ ...f, available_from: e.target.value })} /></Field>
            <Field label="Available to"><Input type="time" value={f.available_to ?? ''} onChange={(e) => setF({ ...f, available_to: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 items-end gap-3">
            <Field label="Sort order"><Input type="number" value={f.sort ?? 0} onChange={(e) => setF({ ...f, sort: Number(e.target.value) })} /></Field>
            <label className="flex h-9 items-center gap-2 text-sm"><Switch checked={f.active ?? true} onCheckedChange={(a) => setF({ ...f, active: a })} />Visible</label>
          </div>
          <Button size="lg" disabled={busy} onClick={() => void submit()}>{busy ? 'Saving…' : 'Save category'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ItemDialog({ item, onClose, onDelete }: { item: ItemForm; onClose: () => void; onDelete?: () => void }) {
  const [f, setF] = useState(item);
  const [busy, setBusy] = useState(false);
  const two = (f.variants?.length ?? 0) > 0;
  const channels = f.channels ?? ['dine_in', 'delivery'];
  const toggleChannel = (id: MenuChannel, on: boolean) =>
    setF({ ...f, channels: on ? [...new Set([...channels, id])] : channels.filter((c) => c !== id) });

  const submit = async () => {
    if (!f.name_en?.trim() || !f.category_id) return toast.error('Name is required');
    if (channels.length === 0) return toast.error('Choose at least one menu (Table or Home)');
    setBusy(true);
    try {
      await saveItem({ ...f, channels, variants: f.variants ?? null, name_en: f.name_en, slug: f.slug || slug(f.name_en), category_id: f.category_id });
      toast.success('Dish saved');
      onClose();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  const setVariant = (i: number, price: number) =>
    setF({ ...f, variants: (f.variants ?? []).map((v, k) => (k === i ? { ...v, price } : v)) });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-auto">
        <DialogHeader><DialogTitle>{f.id ? 'Edit' : 'New'} dish</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius)] border bg-muted">
              {f.image_url ? <img src={f.image_url} alt="" className="size-full object-cover" /> : <ImageOff className="size-5 text-muted-foreground" />}
            </div>
            <div className="flex flex-wrap gap-2">
              <ImageUpload label={f.image_url ? 'Replace photo' : 'Upload photo'} onUploaded={(url) => setF({ ...f, image_url: url })} />
              {f.image_url && <Button size="sm" variant="ghost" onClick={() => setF({ ...f, image_url: null })}>Remove</Button>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><Input value={f.name_en ?? ''} placeholder="Chicken Biryani" onChange={(e) => setF({ ...f, name_en: e.target.value })} /></Field>
            <Field label="Arabic name"><Input dir="rtl" value={f.name_ar ?? ''} onChange={(e) => setF({ ...f, name_ar: e.target.value })} /></Field>
          </div>

          <div className="space-y-2 rounded-[var(--radius)] border p-3">
            <Label>Show on menu</Label>
            {CHANNELS.map((ch) => (
              <label key={ch.id} className="flex items-center gap-2 text-sm">
                <Checkbox checked={channels.includes(ch.id)} onCheckedChange={(c) => toggleChannel(ch.id, c === true)} />
                {ch.label} menu <span className="text-muted-foreground">{ch.id === 'dine_in' ? '(order at table)' : '(delivery and pickup)'}</span>
              </label>
            ))}
          </div>

          <div className="space-y-3 rounded-[var(--radius)] border p-3">
            <Label>Price</Label>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={f.on_request ?? false} onCheckedChange={(c) => setF({ ...f, on_request: c === true })} />Price on request</label>
            {!f.on_request && (
              <>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={two} onCheckedChange={(c) => setF({ ...f, variants: c === true ? [{ label: 'Half', price: 0 }, { label: 'Full', price: 0 }] : null })} />Half / Full prices</label>
                {two ? (
                  <div className="grid grid-cols-2 gap-3">
                    {f.variants?.map((v, i) => <Field key={v.label} label={`${v.label} (AED)`}><Input type="number" inputMode="decimal" value={v.price} onChange={(e) => setVariant(i, Number(e.target.value))} /></Field>)}
                  </div>
                ) : (
                  <Field label="Price (AED)"><Input type="number" inputMode="decimal" step="0.5" value={f.price ?? ''} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} /></Field>
                )}
              </>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm"><Switch checked={f.available ?? true} onCheckedChange={(a) => setF({ ...f, available: a })} />In stock</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={f.popular ?? false} onCheckedChange={(a) => setF({ ...f, popular: a })} />Popular (shown on Home)</label>
          </div>

          <div className="flex gap-2">
            {onDelete && <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={onDelete}><Trash2 className="size-4" />Delete</Button>}
            <Button size="lg" className="flex-1" disabled={busy} onClick={() => void submit()}>{busy ? 'Saving…' : 'Save dish'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
