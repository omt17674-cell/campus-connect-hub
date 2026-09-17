import { useState } from "react";
import { Megaphone, Send, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusEvent } from "@/lib/types";
import { campusStore } from "@/lib/campus-store";
import { cn } from "@/lib/utils";

interface EventBroadcastModalProps {
  event: CampusEvent;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EventBroadcastModal({
  event,
  onClose,
  onSuccess,
}: EventBroadcastModalProps) {
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"normal" | "high" | "urgent">("normal");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      campusStore.sendEventBroadcast(event.id, message.trim(), priority);
      setIsSending(false);
      setSentSuccess(true);
      if (onSuccess) onSuccess();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 shadow-2xl text-foreground">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-md hover:bg-background"
        >
          <X className="size-4" />
        </button>

        {sentSuccess ? (
          <div className="py-6 text-center animate-in zoom-in-95">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 mb-3">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="font-display text-lg font-black">Announcement Sent!</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Broadcast delivered to all {event.registeredCount} registered participants and logged in the academic audit ledger.
            </p>
            <Button
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-[#1A3C6E] text-xs font-bold text-white shadow-md hover:bg-[#1A3C6E]/90"
            >
              Done
            </Button>
          </div>
        ) : (
          <div>
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] text-[#F2A93B] shadow-lg shadow-[#1A3C6E]/30">
                <Megaphone className="size-6" />
              </div>
              <h3 className="mt-3 font-display text-lg font-black">
                Broadcast Live Event Alert
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Push instant notification to all registered attendees for:
              </p>
              <p className="font-bold text-xs text-foreground mt-0.5">{event.title}</p>
            </div>

            <form onSubmit={handleSend} className="mt-5 space-y-4">
              {/* Priority Selector */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority("normal")}
                    className={cn(
                      "rounded-xl border p-2 text-center text-xs font-bold transition",
                      priority === "normal"
                        ? "border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    ℹ️ Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority("high")}
                    className={cn(
                      "rounded-xl border p-2 text-center text-xs font-bold transition",
                      priority === "high"
                        ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    ⚡ High
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority("urgent")}
                    className={cn(
                      "rounded-xl border p-2 text-center text-xs font-bold transition",
                      priority === "urgent"
                        ? "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    🚨 Urgent
                  </button>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  Announcement Message
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Venue moved to Seminar Hall 2, Block C. Starting in 10 minutes!"
                  className="w-full rounded-2xl border border-border bg-background p-3 text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              {/* Quick Template Pills */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground self-center mr-1">Quick Templates:</span>
                {[
                  "Starting in 10 mins! Please punch in.",
                  "Hardware kits ready at Lab 4.",
                  "Venue shifted to Block C Auditorium.",
                ].map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => setMessage(tpl)}
                    className="rounded-lg border border-border/80 bg-card/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    {tpl}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-1/2 rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSending || !message.trim()}
                  className="w-1/2 rounded-xl bg-[#1A3C6E] text-xs font-bold text-[#F2A93B] hover:bg-[#1A3C6E]/90 shadow-md flex items-center justify-center gap-1.5"
                >
                  {isSending ? "Broadcasting..." : (
                    <>
                      <Send className="size-3.5" /> Broadcast
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
