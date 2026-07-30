import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Placeholder only, per this sprint's brief -- shot-by-shot fielding
// position data isn't captured by the scoring pad yet (see
// lib/liveScoring/aiHooks.ts's ShotClassificationProvider for the future
// extension point that would supply it).
export function WagonWheelPlaceholder() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Wagon Wheel</CardTitle>
        <CardDescription>Shot placement map -- coming soon</CardDescription>
      </CardHeader>
      <div className="flex items-center justify-center pb-5">
        <svg viewBox="0 0 200 200" className="h-44 w-44 opacity-40">
          <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-wood" />
          <circle cx="100" cy="100" r="55" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-2" />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI) / 4;
            const x = 100 + 96 * Math.cos(angle);
            const y = 100 + 96 * Math.sin(angle);
            return <line key={i} x1="100" y1="100" x2={x} y2={y} stroke="currentColor" strokeWidth="0.5" className="text-muted-2" />;
          })}
          <rect x="94" y="80" width="12" height="40" rx="2" fill="currentColor" className="text-wood" />
        </svg>
      </div>
    </Card>
  );
}
