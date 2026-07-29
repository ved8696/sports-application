import { Users } from "lucide-react";
import { ComingSoon } from "@/components/mobile/coming-soon";

export default function PlayersPage() {
  return (
    <ComingSoon
      title="Players"
      note="A mobile player roster and stats view is planned for a later sprint."
      icon={Users}
    />
  );
}
