import {
  AlertTriangle,
  Award,
  CheckCircle2,
  HelpCircle,
  PauseCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  description: string;
  badgeText?: string;
  bullets?: string[];
  confirmText?: string;
  cancelText?: string;
  variant?: "success" | "warning" | "danger" | "info";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  description,
  badgeText,
  bullets = [],
  confirmText = "Confirm Action",
  cancelText = "Cancel",
  variant = "success",
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const iconConfig = {
    success: {
      icon: Award,
      headerBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      btnClass:
        "bg-gradient-to-r from-emerald-600 to-[#1A3C6E] hover:from-emerald-700 hover:to-[#122b50] text-white shadow-lg shadow-emerald-600/20",
      badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    },
    warning: {
      icon: PauseCircle,
      headerBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      btnClass:
        "bg-gradient-to-r from-amber-600 to-[#1A3C6E] hover:from-amber-700 hover:to-[#122b50] text-white shadow-lg shadow-amber-600/20",
      badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    },
    danger: {
      icon: AlertTriangle,
      headerBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      btnClass:
        "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-lg shadow-rose-600/20",
      badgeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    },
    info: {
      icon: HelpCircle,
      headerBg: "bg-[#1A3C6E]/10 text-[#1A3C6E] dark:text-[#F2A93B] border-[#1A3C6E]/20",
      btnClass:
        "bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] hover:opacity-95 text-white shadow-lg shadow-[#1A3C6E]/20",
      badgeColor: "bg-[#1A3C6E]/15 text-[#1A3C6E] dark:text-[#F2A93B]",
    },
  }[variant];

  const Icon = iconConfig.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <X className="size-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pb-4 border-b border-border/60">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
              iconConfig.headerBg
            )}
          >
            <Icon className="size-6" />
          </div>
          <div className="pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-black text-foreground">
                {title}
              </h3>
              {badgeText && (
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider",
                    iconConfig.badgeColor
                  )}
                >
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-3">
          <p className="text-sm text-foreground/90 font-medium leading-relaxed">
            {description}
          </p>

          {bullets.length > 0 && (
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-3.5 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Actions Performed:
              </span>
              <ul className="space-y-1.5 text-xs text-foreground/80">
                {bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 mt-0.5 text-emerald-500 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 rounded-xl px-5 text-xs font-bold hover:bg-muted/80"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn("h-10 rounded-xl px-5 text-xs font-black", iconConfig.btnClass)}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
