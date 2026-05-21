"use client";

import { useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, X } from "lucide-react";
import { getCroppedImageFile } from "@/lib/crop-image";
import { Button } from "@/components/ui/button";

type CropImageModalProps = {
  file: File;
  onCancel: () => void;
  onSave: (croppedFile: File) => void;
};

export function CropImageModal({
  file,
  onCancel,
  onSave,
}: CropImageModalProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  async function handleSaveCrop() {
    if (!imageUrl || !croppedAreaPixels) {
      return;
    }

    setIsSaving(true);

    try {
      const croppedFile = await getCroppedImageFile(
        imageUrl,
        croppedAreaPixels,
        file.name
      );

      onSave(croppedFile);
    } catch (error) {
      console.error("Greška pri cropovanju slike:", error);
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-950">
              Uredi sliku proizvoda
            </h2>
            <p className="text-sm text-neutral-500">
              Namjesti sliku u omjeru 4:5 za uredan prikaz u shopu.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-2 hover:bg-neutral-100"
            aria-label="Zatvori"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative h-[520px] bg-neutral-950">
          {imageUrl ? (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={4 / 5}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedPixels) =>
                setCroppedAreaPixels(croppedPixels)
              }
            />
          ) : null}
        </div>

        <div className="space-y-4 border-t p-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Zoom
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={onCancel}
              disabled={isSaving}
            >
              Preskoči
            </Button>

            <Button
              type="button"
              className="rounded-full"
              onClick={handleSaveCrop}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Spremanje...
                </>
              ) : (
                "Sačuvaj crop"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
