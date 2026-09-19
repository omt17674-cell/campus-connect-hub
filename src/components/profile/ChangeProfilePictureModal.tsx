import React, { useState, useRef } from "react";
import { Camera, Upload, X, Check, Image as ImageIcon, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { campusStore } from "@/lib/campus-store";
import { toast } from "sonner";

interface ChangeProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  userName?: string;
}

const AVATAR_PRESETS = [
  { id: "student-1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80", label: "Professional" },
  { id: "student-2", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80", label: "Campus" },
  { id: "student-3", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80", label: "Engineer" },
  { id: "student-4", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80", label: "Scholar" },
  { id: "student-5", url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80", label: "Creative" },
  { id: "student-6", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80", label: "Executive" },
];

export function ChangeProfilePictureModal({
  isOpen,
  onClose,
  currentAvatar = "",
  userName = "Student",
}: ChangeProfilePictureModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(currentAvatar);
  const [customUrl, setCustomUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isPhotoUrl = (url?: string) =>
    Boolean(url && (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")));

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "ST";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Please select a photo under 5MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedPhoto(base64);
      setIsUploading(false);
      toast.success("Photo selected successfully!");
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    campusStore.updateUserProfilePicture(selectedPhoto);
    onClose();
  };

  const handleResetToInitials = () => {
    setSelectedPhoto(initials);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[#1A3C6E] text-[#F2A93B]">
            <Camera className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-black text-foreground">Change Profile Picture</h3>
            <p className="text-xs text-muted-foreground">Upload your photo or choose a verified campus avatar</p>
          </div>
        </div>

        {/* Current / Live Preview */}
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-muted/40 p-5">
          <div className="relative group">
            <div className="size-24 overflow-hidden rounded-2xl border-4 border-[#F2A93B] shadow-xl bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] flex items-center justify-center">
              {isPhotoUrl(selectedPhoto) ? (
                <img src={selectedPhoto} alt={userName} className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-3xl font-black text-[#F2A93B]">
                  {selectedPhoto || initials}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold gap-1"
            >
              <Upload className="size-4 text-[#F2A93B]" />
              <span>Browse File</span>
            </button>
          </div>
          <span className="mt-3 text-xs font-semibold text-foreground">{userName}</span>
          <span className="text-[11px] text-muted-foreground">Preview of your GSFC Digital Card & Passport</span>
        </div>

        {/* Upload Action */}
        <div className="mt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full gap-2 rounded-xl bg-[#1A3C6E] font-bold text-white hover:bg-[#1A3C6E]/90 shadow-md"
          >
            <Upload className="size-4 text-[#F2A93B]" />
            {isUploading ? "Uploading Image..." : "Upload Photo from Device"}
          </Button>
        </div>

        {/* Or Select from Presets */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="size-3 text-[#F2A93B]" /> Campus Avatar Presets
            </span>
            <button
              type="button"
              onClick={handleResetToInitials}
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
            >
              <RefreshCw className="size-3" /> Use Initials ({initials})
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {AVATAR_PRESETS.map((preset) => {
              const isSelected = selectedPhoto === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPhoto(preset.url)}
                  className={`relative overflow-hidden rounded-xl border-2 aspect-square transition-all ${
                    isSelected
                      ? "border-[#F2A93B] ring-2 ring-[#F2A93B]/40 scale-105 shadow-md"
                      : "border-border/60 hover:border-brand/60 opacity-80 hover:opacity-100"
                  }`}
                  title={preset.label}
                >
                  <img src={preset.url} alt={preset.label} className="h-full w-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Check className="size-4 text-[#F2A93B] stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom URL Input (Optional) */}
        <div className="mt-4 flex gap-2">
          <input
            type="url"
            placeholder="Or paste an image URL (https://...)"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="h-9 flex-1 rounded-xl border border-border/70 bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (customUrl.trim()) setSelectedPhoto(customUrl.trim());
            }}
            className="rounded-xl text-xs font-bold"
          >
            Apply URL
          </Button>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-border/60 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
          >
            <Check className="mr-1.5 size-3.5" /> Save Profile Picture
          </Button>
        </div>
      </div>
    </div>
  );
}
