import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, X, Loader2, Image as ImageIcon } from "lucide-react";

interface PhotoUploadProps {
  taskId?: string;
  type: "before" | "after";
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

const PhotoUpload = ({ type, photos, onPhotosChange, maxPhotos = 5, disabled = false }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (photos.length + files.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }
    setUploading(true);
    const newUrls: string[] = [];
    const readers = Array.from(files).map(
      (file) =>
        new Promise<void>((resolve) => {
          if (!file.type.startsWith("image/")) { toast.error("Only image files are allowed"); resolve(); return; }
          if (file.size > 5 * 1024 * 1024) { toast.error("File size must be less than 5MB"); resolve(); return; }
          const reader = new FileReader();
          reader.onload = (ev) => { if (ev.target?.result) newUrls.push(ev.target.result as string); resolve(); };
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then(() => {
      onPhotosChange([...photos, ...newUrls]);
      toast.success("Photos added successfully");
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  const removePhoto = (index: number) => onPhotosChange(photos.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {type === "before" ? "Before" : "After"} Photos ({photos.length}/{maxPhotos})
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
            <img src={photo} alt={`${type} photo ${index + 1}`} className="w-full h-full object-cover" />
            {!disabled && (
              <button type="button" onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {!disabled && photos.length < maxPhotos && (
          <Card className="aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors border-dashed" onClick={() => fileInputRef.current?.click()}>
            {uploading ? <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" /> : (
              <><Camera className="w-8 h-8 text-muted-foreground mb-2" /><span className="text-xs text-muted-foreground">Add Photo</span></>
            )}
          </Card>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" disabled={disabled || uploading} />
      {photos.length === 0 && disabled && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <ImageIcon className="w-5 h-5 mr-2" />No {type} photos uploaded
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
