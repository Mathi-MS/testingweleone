import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogActions, Button, Box, Slider } from "@mui/material";
import Cropper, { Area } from "react-easy-crop";
import CustomButton from "./custom/CustomButton";

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedImage: string) => void;
  onChangeImage?: () => void;
}

export const ImageCropDialog = ({ open, imageSrc, onClose, onSave, onChangeImage }: ImageCropDialogProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx?.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL("image/jpeg");
  };

  const handleSave = async () => {
    if (croppedAreaPixels) {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onSave(croppedImage);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ height: 400, position: "relative" }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </DialogContent>
      <Box sx={{ px: 3, py: 2 }}>
        <Slider value={zoom} min={1} max={3} step={0.1} onChange={(_, value) => setZoom(value as number)} color="success"/>
      </Box>
      <DialogActions>
        {onChangeImage && (
          <CustomButton
            type="button"
            variant="outlined"
            label="Change Image"
            onClick={onChangeImage}
            boxSx={{width:"max-content"}}
          />
        )}
        <CustomButton
          type="button"
          variant="outlined"
          label="Cancel"
          onClick={onClose}
          boxSx={{width:"max-content"}}
        />
        <CustomButton
          type="submit"
          variant="contained"
          label={"Save"}
          onClick={handleSave}
          boxSx={{width:"max-content"}}
        />
      </DialogActions>
    </Dialog>
  );
};
