import { PlusSquare } from "lucide-react";
import { ComingSoon } from "@/components/mobile/coming-soon";

export default function NewMatchPage() {
  return (
    <ComingSoon
      title="Start New Match"
      note="The match-creation wizard (details, teams, toss) is the next sprint after this one."
      icon={PlusSquare}
      backHref="/dashboard"
    />
  );
}
