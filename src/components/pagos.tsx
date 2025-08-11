"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from 'lucide-react';

interface PagosPageProps {
    processTransaction: (newUsdtAmount: number, newBsAmount: number, transactionDetails: any) => boolean;
    userBalance: number;
    bsBalance: number;
    bcvRates: { dolar: number };
}

const PagosPage = ({ processTransaction, userBalance, bsBalance, bcvRates }: PagosPageProps) => {
    const [amount, setAmount] = useState('');
    const [service, setService] = useState('electricidad');
    const [billNumber, setBillNumber] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        
        let newBsBalance = bsBalance;
        let newUsdtBalance = userBalance;
        let usdtUsed = 0;
        let description = `Pago de ${service} | Ref: ${billNumber || 'N/A'}`;

        if (numericAmount > newBsBalance) {
            const remainingBs = numericAmount - newBsBalance;
            const usdtRequired = remainingBs / bcvRates.dolar;
            
            newBsBalance = 0;
            newUsdtBalance -= usdtRequired;
            usdtUsed = usdtRequired;
            description += ' (Conversión USDT/Bs)';
        } else {
            newBsBalance -= numericAmount;
        }

        const success = processTransaction(
            newUsdtBalance,
            newBsBalance,
            {
                type: 'Pago de Servicio',
                description: description,
                amount: -numericAmount,
                currency: 'BS',
                usdtUsed: usdtUsed,
            }
        );

        if (success) {
            setAmount('');
            setBillNumber('');
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline text-gray-800">Pagar Servicios</h1>
                <p className="text-muted-foreground">Realiza tus pagos de facturas de forma fácil.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Simular un Pago de Factura</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Si tu saldo en Bolívares es insuficiente, se convertirá el monto necesario de tu saldo en USDT automáticamente.
                        </AlertDescription>
                    </Alert>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="service">Servicio</Label>
                            <Select value={service} onValueChange={setService}>
                                <SelectTrigger id="service" className="w-full mt-1">
                                    <SelectValue placeholder="Seleccione un servicio" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="electricidad">Electricidad (CORPOELEC)</SelectItem>
                                    <SelectItem value="agua">Agua (HIDROVEN)</SelectItem>
                                    <SelectItem value="gas">Gas</SelectItem>
                                    <SelectItem value="telefono">Teléfono (CANTV)</SelectItem>
                                    <SelectItem value="internet">Internet (ABA)</SelectItem>
                                    <SelectItem value="impuestos">Impuestos Municipales</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="billNumber">Número de Referencia/Factura</Label>
                            <Input
                                id="billNumber"
                                type="text"
                                className="mt-1"
                                placeholder="Ej: 123456789"
                                value={billNumber}
                                onChange={(e) => setBillNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="pago-amount">Monto a Pagar (Bs)</Label>
                            <Input
                                id="pago-amount"
                                type="number"
                                step="0.01"
                                className="mt-1"
                                placeholder="Ej: 1500.50"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <p className="mt-2 text-sm text-muted-foreground">
                                Tasa de conversión: <strong>1 USDT = {bcvRates.dolar.toFixed(2)} Bs</strong>
                            </p>
                        </div>
                        <Button type="submit" className="w-full" disabled={!amount || !billNumber}>
                            Realizar Pago
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PagosPage;