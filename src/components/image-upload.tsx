import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";

// Uploads to Convex storage and returns the public URL.
export default function ImageUpload({ onUploaded, label = "Upload image" }: { onUploaded: (url: string) => void; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const genUrl = useMutation(api.files.generateUploadUrl);
  const getUrl = useMutation(api.files.getUrl);

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      const uploadUrl = await genUrl();
      const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = (await res.json()) as { storageId: string };
      onUploaded(await getUrl({ storageId: storageId as never }));
    } catch {
      toast.error("Upload failed");
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
