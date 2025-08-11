"use client";

import { useState } from 'react';
import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { handleAnalyzeExpenses } from "@/app/actions";
import { BrainCircuit, Landmark, Loader2, Wallet } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface DashboardProps {
    userBalance: number;
    bsBalance: number;
    transactionHistory: Transaction[];
}

type AnalysisResult = {
    summary: string;
    recommendations: string;
} | null;

const Dashboard = ({ userBalance, bsBalance, transactionHistory }: DashboardProps) => {
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const onAnalyze = async () => {
        setLoadingAnalysis(true);
        setAnalysisError(null);
        setAnalysisResult(null);

        const result = await handleAnalyzeExpenses(transactionHistory);

        if (result.success && result.data) {
            setAnalysisResult(result.data);
        } else {
            setAnalysisError(result.error || "An unknown error occurred.");
        }
        setLoadingAnalysis(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline text-gray-800">Dashboard de M.I.A.</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Actual USDT</CardTitle>
                        <Wallet className="h-6 w-6 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold font-headline text-primary">${userBalance.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Actual Bolívares</CardTitle>
                        <Landmark className="h-6 w-6 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold font-headline text-accent">Bs {bsBalance.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Historial de Transacciones</CardTitle>
                        <CardDescription>Tus movimientos más recientes.</CardDescription>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" onClick={onAnalyze} disabled={loadingAnalysis}>
                                {loadingAnalysis ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <BrainCircuit className="mr-2 h-4 w-4" />
                                )}
                                Analizar Gastos
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[625px]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl">Análisis de Gastos con IA</DialogTitle>
                                <DialogDescription>
                                    Resumen y recomendaciones basadas en tu historial de transacciones.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                {loadingAnalysis && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                                {analysisError && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{analysisError}</AlertDescription></Alert>}
                                {analysisResult && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Resumen de Gastos</h3>
                                            <p className="text-sm text-muted-foreground bg-secondary p-4 rounded-md">{analysisResult.summary}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Recomendaciones</h3>
                                            <p className="text-sm text-muted-foreground bg-secondary p-4 rounded-md">{analysisResult.recommendations}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactionHistory.map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell>
                                        <div className="font-medium">{tx.type}</div>
                                        <div className="text-sm text-muted-foreground">{tx.description}</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={tx.amount > 0 ? 'default' : 'destructive'} className={`${tx.amount > 0 ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-red-500/20 text-red-700 border-red-500/30'} font-mono`}>
                                            {tx.amount > 0 ? '+' : ''} {Math.abs(tx.amount).toFixed(2)} {tx.currency}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default Dashboard;
