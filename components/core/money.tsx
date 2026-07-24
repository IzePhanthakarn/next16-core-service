import { formatAmount } from "@/lib/currency";

export const Money = ({ amount }: { amount: number }) => (
  <span className="tabular-nums">
    {formatAmount(amount)}
    <span className="ml-1 text-xs font-normal text-muted-foreground">THB</span>
  </span>
);
