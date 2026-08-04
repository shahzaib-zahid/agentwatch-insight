import { Info } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SCORING_WEIGHTS,
  SIGNAL_LABELS,
  SCORING_DISCLAIMER,
  type ScoreSignals,
} from "@/lib/scoring";

export function HowCalculated({ breakdown }: { breakdown?: Record<string, number> }) {
  const keys = Object.keys(SCORING_WEIGHTS) as (keyof ScoreSignals)[];
  return (
    <Collapsible className="rounded-md border border-border bg-surface-raised/60">
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground">
        <Info className="size-3.5" />
        How this is calculated
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 border-t border-border px-3 py-3 text-xs">
        <p className="text-muted-foreground">
          Weighted average of four signals. Weights live in a single scoring module and can be
          changed without a frontend rebuild.
        </p>
        <ul className="space-y-1.5">
          {keys.map((k) => (
            <li key={k} className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{SIGNAL_LABELS[k]}</span>
              <span className="num shrink-0 font-medium">
                {breakdown?.[k] != null ? `${Math.round(breakdown[k]!)} × ` : ""}
                {Math.round(SCORING_WEIGHTS[k] * 100)}%
              </span>
            </li>
          ))}
        </ul>
        <p className="pt-1 text-[11px] italic text-muted-foreground">{SCORING_DISCLAIMER}</p>
      </CollapsibleContent>
    </Collapsible>
  );
}
