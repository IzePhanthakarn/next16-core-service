import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions",
};

export { TransactionsPage as default } from "@/modules/core/transactions";
