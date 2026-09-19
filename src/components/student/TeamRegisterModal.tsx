import { useState } from "react";
import { Plus, Trash2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CampusEvent, TeamMember } from "@/lib/types";
import { campusStore } from "@/lib/campus-store";
import { toast } from "sonner";

interface TeamRegisterModalProps {
  event: CampusEvent;
  onClose: () => void;
  onSuccess: () => void;
}

export function TeamRegisterModal({
  event,
  onClose,
  onSuccess,
}: TeamRegisterModalProps) {
  const currentUser = campusStore.getState().currentUser;
  const [teamName, setTeamName] = useState("");
  const minMembers = event.minTeamSize || 2;
  const maxMembers = event.maxTeamSize || 4;

  const [members, setMembers] = useState<TeamMember[]>([
    {
      name: currentUser.name,
      rollNo: currentUser.rollNo,
      email: currentUser.email,
    },
    {
      name: "",
      rollNo: "",
      email: "",
    },
  ]);

  const addMember = () => {
    if (members.length < maxMembers) {
      setMembers([...members, { name: "", rollNo: "", email: "" }]);
    }
  };

  const removeMember = (index: number) => {
    if (index === 0) return; // Cannot remove captain
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    // Validate that at least minMembers are filled
    const validMembers = members.filter((m) => m.name.trim() && m.rollNo.trim());
    if (validMembers.length < minMembers) {
      toast.error(`Please add at least ${minMembers} members for this team event.`);
      return;
    }

    const res = await campusStore.registerForEvent(event.id, true, teamName, validMembers);
    if (res.success) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent/20 text-[#F2A93B]">
            <Users className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Team Registration
            </h3>
            <p className="text-xs text-muted-foreground">{event.title}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Team Name *
            </Label>
            <Input
              required
              placeholder="e.g. CodeCrafters / GSFC Titans"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="mt-1 rounded-xl"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Team Members ({members.length}/{maxMembers})
              </Label>
              {members.length < maxMembers && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addMember}
                  className="h-7 text-xs font-bold text-brand"
                >
                  <Plus className="mr-1 size-3" /> Add Member
                </Button>
              )}
            </div>

            <div className="mt-2 max-h-56 space-y-2.5 overflow-y-auto pr-1">
              {members.map((member, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border/70 bg-card/60 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand">
                      {index === 0 ? "Team Captain (You)" : `Teammate #${index + 1}`}
                    </span>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMember(index)}
                        className="size-6 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Input
                      required
                      disabled={index === 0}
                      placeholder="Student Full Name"
                      value={member.name}
                      onChange={(e) => updateMember(index, "name", e.target.value)}
                      className="h-8 rounded-lg text-xs"
                    />
                    <Input
                      required
                      disabled={index === 0}
                      placeholder="Roll No (e.g. GSFC-CS-0142)"
                      value={member.rollNo}
                      onChange={(e) => updateMember(index, "rollNo", e.target.value)}
                      className="h-8 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-brand/5 p-3 text-xs text-muted-foreground">
            💡 Attendance for team events can be verified by the captain's single QR check-in or individual scans.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-[#1A3C6E] text-white hover:bg-[#1A3C6E]/90"
            >
              Confirm Team Registration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
