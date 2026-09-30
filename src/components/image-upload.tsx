import { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/db.ts';
import { Button } from '@/components/ui/button.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';

export default function ImageUpload({ onUploaded, label = 'Upload image' }: { onUploaded: (url: string) => void; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadImage(file);
      onUploaded(url);
    } catch {
      toast.error('Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && void onFile(e.target.files[0])} />
      <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? <Spinner /> : <ImagePlus className="size-4" />}{label}
      </Button>
    </>
  );
}
