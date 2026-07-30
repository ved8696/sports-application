"use client";

import { PauseCircle, PlayCircle, FlagOff, CloudRain, Ban } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";

// Secondary match-lifecycle actions, tucked behind a sheet so the main
// scoring surface stays uncluttered -- Pause/Resume and (rarely) Declare/
// No Result/Draw. Declare only makes sense for an unlimited-overs innings
// still batting; No Result/Draw end the match outright.
export function MatchControlsSheet({
  open,
  onOpenChange,
  isPaused,
  canDeclare,
  canMarkDraw,
  onPause,
  onResume,
  onDeclare,
  onNoResult,
  onDraw,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPaused: boolean;
  canDeclare: boolean;
  canMarkDraw: boolean;
  onPause: () => void;
  onResume: () => void;
  onDeclare: () => void;
  onNoResult: () => void;
  onDraw: () => void;
}) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Match Controls">
      <div className="flex flex-col gap-2.5 pb-4">
        {isPaused ? (
          <Button variant="outline" size="md" onClick={onResume} className="justify-start gap-2.5">
            <PlayCircle size={16} />
            Resume Match
          </Button>
        ) : (
          <Button variant="outline" size="md" onClick={onPause} className="justify-start gap-2.5">
            <PauseCircle size={16} />
            Pause Match
          </Button>
        )}

        {canDeclare && (
          <Button variant="outline" size="md" onClick={onDeclare} className="justify-start gap-2.5">
            <FlagOff size={16} />
            Declare Innings
          </Button>
        )}

        <Button variant="outline" size="md" onClick={onNoResult} className="justify-start gap-2.5 text-red">
          <CloudRain size={16} />
          Mark No Result
        </Button>

        {canMarkDraw && (
          <Button variant="outline" size="md" onClick={onDraw} className="justify-start gap-2.5 text-red">
            <Ban size={16} />
            Mark Match Drawn
          </Button>
        )}
      </div>
    </BottomSheet>
  );
}
