import { useState } from "react";
import { Star, MessageSquare, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusEvent } from "@/lib/types";
import { campusStore } from "@/lib/campus-store";
import { cn } from "@/lib/utils";

interface EventFeedbackModalProps {
  event: CampusEvent;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export function EventFeedbackModal({
  event,
  onClose,
  onSubmitSuccess,
}: EventFeedbackModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      campusStore.submitEventFeedback(event.id, rating, comment.trim());
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onSubmitSuccess) onSubmitSuccess();
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

        {isSubmitted ? (
          <div className="py-6 text-center animate-in zoom-in-95">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 mb-3">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="font-display text-lg font-black">Feedback Submitted!</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Your feedback has been shared with {event.organizerName}. Thank you for helping improve GSFC campus events!
            </p>
            <Button
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-[#1A3C6E] text-xs font-bold text-white shadow-md hover:bg-[#1A3C6E]/90"
            >
              Close
            </Button>
          </div>
        ) : (
          <div>
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#F2A93B]/20 text-[#F2A93B]">
                <MessageSquare className="size-6" />
              </div>
              <h3 className="mt-3 font-display text-lg font-black">
                Event Review & Feedback
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {event.title}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Star Rating */}
              <div className="text-center">
                <label className="text-xs font-bold text-muted-foreground block mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={cn(
                          "size-7 transition-colors",
                          (hoverRating || rating) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground mt-1">
                  {rating === 5 && "🌟 Outstanding & Highly Educational"}
                  {rating === 4 && "👍 Very Good Experience"}
                  {rating === 3 && "👌 Decent Session"}
                  {rating === 2 && "⚠️ Needs Improvement"}
                  {rating === 1 && "👎 Unsatisfactory"}
                </p>
              </div>

              {/* Text feedback */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  Your Comments & Suggestions
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you learn? How was the speaker, venue setup, or hands-on session?"
                  className="w-full rounded-2xl border border-border bg-background p-3 text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
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
                  disabled={isSubmitting || !comment.trim()}
                  className="w-1/2 rounded-xl bg-[#1A3C6E] text-xs font-bold text-[#F2A93B] hover:bg-[#1A3C6E]/90 shadow-md"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
