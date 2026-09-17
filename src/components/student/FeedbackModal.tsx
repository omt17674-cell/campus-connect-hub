import { useState } from "react";
import { Award, Check, Star, X } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CampusEvent } from "@/lib/types";
import { campusStore } from "@/lib/campus-store";
import { cn } from "@/lib/utils";

interface FeedbackModalProps {
  event: CampusEvent;
  onClose: () => void;
}

export function FeedbackModal({ event, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const predefinedTags = [
    "Inspiring Speaker",
    "Hands-on Coding",
    "Well-organized",
    "Great Mentorship",
    "High Energy",
  ];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalComment = selectedTags.length > 0
      ? `[${selectedTags.join(", ")}] ${comment}`
      : comment;

    campusStore.submitFeedback(event.id, rating, finalComment);
    setSubmitted(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Check className="size-8" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-foreground">
              Thank you for your feedback!
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Your review helps organizers improve future GSFC campus events.
            </p>
            <div className="mt-4 flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Award className="size-3.5" />
              <span>+20 XP Bonus Awarded</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center">
              <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F2A93B]">
                Event Feedback
              </span>
              <h3 className="mt-2 font-display text-xl font-black text-foreground">
                How was your experience?
              </h3>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                {event.title}
              </p>
            </div>

            {/* Interactive Stars */}
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={cn(
                      "size-8 transition-colors",
                      (hoverRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Quick Tags */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Highlights
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {predefinedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                      selectedTags.includes(tag)
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border/70 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Detailed Comments (Optional)
              </p>
              <Textarea
                placeholder="Share your thoughts on the session, organization, or learnings..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="mt-1.5 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <Award className="size-3.5 text-[#F2A93B]" /> Earn +20 XP
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="rounded-xl"
                >
                  Skip
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl bg-[#1A3C6E] text-white hover:bg-[#1A3C6E]/90"
                >
                  Submit Review
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
