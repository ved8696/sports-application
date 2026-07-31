"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// The one uppercase, wood-accented section heading used to group content on
// every primary tab screen (Dashboard, Matches, Tournaments, ...). Pulled out
// of app/dashboard/page.tsx so every screen gets the exact same styling and
// entrance animation instead of each hand-rolling a lookalike.
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("mb-2.5 border-l-2 border-wood pl-2 text-[11px] font-bold uppercase tracking-wide text-wood", className)}
    >
      {children}
    </motion.p>
  );
}
