import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Todo Lists",
};

export { TodosPage as default } from "@/modules/core/todos";
