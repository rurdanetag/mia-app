'use server';
/**
 * @fileOverview An expense analysis AI agent.
 *
 * - analyzeExpenses - A function that handles the expense analysis process.
 * - AnalyzeExpensesInput - The input type for the analyzeExpenses function.
 * - AnalyzeExpensesOutput - The return type for the analyzeExpenses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransactionSchema = z.object({
  id: z.string(),
  type: z.string(),
  description: z.string(),
  amount: z.number(),
  date: z.string(),
  currency: z.string(),
});

const AnalyzeExpensesInputSchema = z.object({
  transactionHistory: z.array(TransactionSchema).describe('The user transaction history.'),
});
export type AnalyzeExpensesInput = z.infer<typeof AnalyzeExpensesInputSchema>;

const AnalyzeExpensesOutputSchema = z.object({
  summary: z.string().describe('A summary of the user spending habits.'),
  recommendations: z.string().describe('Recommendations for reducing expenses.'),
});
export type AnalyzeExpensesOutput = z.infer<typeof AnalyzeExpensesOutputSchema>;

export async function analyzeExpenses(input: AnalyzeExpensesInput): Promise<AnalyzeExpensesOutput> {
  return analyzeExpensesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeExpensesPrompt',
  input: {schema: AnalyzeExpensesInputSchema},
  output: {schema: AnalyzeExpensesOutputSchema},
  prompt: `You are a personal finance advisor.

Analyze the following transaction history and provide a summary of spending habits and recommendations for reducing expenses.

Transaction History:
{{#each transactionHistory}}
- {{date}} - {{type}} - {{description}} - {{amount}} {{currency}}
{{/each}}`,
});

const analyzeExpensesFlow = ai.defineFlow(
  {
    name: 'analyzeExpensesFlow',
    inputSchema: AnalyzeExpensesInputSchema,
    outputSchema: AnalyzeExpensesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
