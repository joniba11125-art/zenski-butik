export type PixelCropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function createImage(imageUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = imageUrl;
  });
}

export async function getCroppedImageFile(
  imageUrl: string,
  croppedAreaPixels: PixelCropArea,
  originalFileName: string
) {
  const image = await createImage(imageUrl);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas nije dostupan.");
  }

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  context.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Crop slike nije uspio."));
          return;
        }

        resolve(result);
      },
      "image/jpeg",
      0.92
    );
  });

  const cleanName = originalFileName.replace(/\.[^/.]+$/, "");
  return new File([blob], `${cleanName}-crop.jpg`, {
    type: "image/jpeg",
  });
}
