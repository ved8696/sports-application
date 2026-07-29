import { CircleDot } from "lucide-react";
import { ComingSoon } from "@/components/mobile/coming-soon";

export default function ScorePage() {
  return (
    <ComingSoon
      title="Live Scoring"
      note="Ball-by-ball scoring lands in its own sprint, right after Match Creation."
      icon={CircleDot}
    />
  );
}
