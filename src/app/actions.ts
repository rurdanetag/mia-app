"use server";

import { analyzeExpenses } from "@/ai/flows/expense-analyzer";
import type { Transaction } from "@/lib/types";

export async function handleAnalyzeExpenses(transactionHistory: Omit<Transaction, 'id'>[]) {
  try {
    const analysis = await analyzeExpenses({ transactionHistory: transactionHistory.map(t => ({...t, id: 'temp'})) });
    return { success: true, data: analysis };
  } catch (error) {
    console.error("Error analyzing expenses:", error);
    // Check for specific Genkit/API errors if possible
    if (error instanceof Error && error.message.includes('SAFETY')) {
         return { success: false, error: "El análisis fue bloqueado por políticas de seguridad. Intenta con un historial de transacciones diferente." };
    }
    return { success: false, error: "No se pudo conectar con el servicio de análisis. Inténtalo de nuevo más tarde." };
  }
}
