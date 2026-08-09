import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NicknameDialog({ open, onOpenChange, score, scoreLabel, defaultName, onSubmit }) {
  const [name, setName] = useState(defaultName || "");
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    setSaving(true);
    await onSubmit(name.trim() || "Anonim");
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-[#0d0d0d] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-zinc-50">
            Salvează scorul
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {scoreLabel}:{" "}
            <span className="font-mono font-bold text-cyan-400">
              {Number(score).toLocaleString("ro-RO")}
            </span>
            . Introdu porecla ta pentru clasament.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Input
            data-testid="nickname-input"
            autoFocus
            maxLength={20}
            placeholder="Porecla ta..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handle()}
            className="border-zinc-700 bg-zinc-900 font-mono text-zinc-50 focus-visible:ring-cyan-500"
          />
          <div className="flex gap-3">
            <Button
              data-testid="skip-score-btn"
              variant="outline"
              className="flex-1 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
              onClick={() => onOpenChange(false)}
            >
              Renunță
            </Button>
            <Button
              data-testid="submit-score-btn"
              disabled={saving}
              className="flex-1 bg-cyan-500 font-semibold text-black hover:bg-cyan-400"
              onClick={handle}
            >
              {saving ? "Se salvează..." : "Trimite scorul"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
