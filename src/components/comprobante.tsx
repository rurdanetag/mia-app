"use client";

import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import type { Page } from "@/app/page";

interface ComprobanteProps {
    lastTransaction: Transaction | null;
    navigateTo: (page: Page) => void;
}

const Comprobante = ({ lastTransaction, navigateTo }: ComprobanteProps) => {
    if (!lastTransaction) {
        return (
            <Card className="animate-fade-in">
                <CardHeader>
                    <CardTitle>No hay transacción reciente</CardTitle>
                    <CardDescription>Realiza una operación para ver el comprobante.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Button onClick={() => navigateTo('home')}>Volver al Inicio</Button>
                </CardContent>
            </Card>
        );
    }

    // Format date from ISO string to a more readable format
    const formattedDate = new Date(lastTransaction.date).toLocaleString('es-VE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    
    return (
        <div className="max-w-md mx-auto">
            <Card className="animate-fade-in shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Comprobante de Transacción</CardTitle>
                    <CardDescription>ID de Transacción: {lastTransaction.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border-t border-dashed pt-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tipo:</span>
                            <span className="font-semibold">{lastTransaction.type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Descripción:</span>
                            <span className="font-semibold text-right">{lastTransaction.description}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Fecha:</span>
                            <span className="font-semibold">{formattedDate}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-4 border-t pt-4">
                        <span className="text-lg font-bold text-foreground">Monto:</span>
                        <span className={`text-xl font-bold font-mono ${lastTransaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {lastTransaction.amount >= 0 ? '+' : ''}{Math.abs(lastTransaction.amount).toFixed(2)} {lastTransaction.currency}
                        </span>
                    </div>
                    <Button className="w-full mt-4" onClick={() => navigateTo('home')}>
                        Volver al Inicio
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Comprobante;
