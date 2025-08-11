"use server";

import { analyzeExpenses } from "@/ai/flows/expense-analyzer";
import type { Transaction } from "@/lib/types";

export async function handleAnalyzeExpenses(transactionHistory: Transaction[]) {
  try {
    const analysis = await analyzeExpenses({ transactionHistory });
    return { success: true, data: analysis };
  } catch (error) {
    console.error("Error analyzing expenses:", error);
    return { success: false, error: "Failed to analyze expenses." };
  }
}
