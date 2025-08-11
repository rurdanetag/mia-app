"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2 } from 'lucide-react';

interface PagosPageProps {
    processTransaction: (newUsdtAmount: number, newBsAmount: number, transactionDetails: any) => Promise<boolean>;
    userBalance: number;
    bsBalance: number;
    bcvRates: { dolar: number };
}

const PagosPage = ({ processTransaction, userBalance, bsBalance, bcvRates }: PagosPageProps) => {
    const [amount, setAmount] = useState('');
    const [service, setService] = useState('');
    const [billNumber, setBillNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const numericAmount = parseFloat(amount);
        
        let newBsBalance = bsBalance;
        let newUsdtBalance = userBalance;
        let usdtUsed = 0;
        let description = `Pago de ${service || 'servicio'} | Ref: ${billNumber || 'N/A'}`;

        if (numericAmount > newBsBalance) {
            const remainingBs = numericAmount - newBsBalance;
            const usdtRequired = remainingBs / bcvRates.dolar;
            
            if (usdtRequired > userBalance) {
                // Not enough total balance
                setIsLoading(false);
                // Here you might want to show an error modal
                console.error("Saldo total insuficiente");
                return;
            }

            newBsBalance = 0;
            newUsdtBalance -= usdtRequired;
            usdtUsed = usdtRequired;
            description += ' (Conversión USDT/Bs)';
        } else {
            newBsBalance -= numericAmount;
        }

        const success = await processTransaction(
            newUsdtBalance,
            newBsBalance,
            {
                type: 'Pago de Servicio',
                description: description,
                amount: numericAmount,
                currency: 'BS',
                usdtUsed: usdtUsed,
            }
        );

        if (success) {
            setAmount('');
            setBillNumber('');
            setService('');
        }
        setIsLoading(false);
    };

    const numericAmount = parseFloat(amount) || 0;
    const remainingAfterBs = Math.max(0, numericAmount - bsBalance);
    const usdtCost = remainingAfterBs / bcvRates.dolar;
    const hasSufficientBalance = (bsBalance + (userBalance * bcvRates.dolar)) >= numericAmount;

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold font-headline text-gray-800">Pagar Servicios</h1>
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
                            <Select value={service} onValueChange={setService} required>
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
                                required
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
                                required
                            />
                            <p className="mt-2 text-sm text-muted-foreground">
                                Tasa de conversión: <strong>1 USDT = {bcvRates.dolar.toFixed(2)} Bs</strong>
                            </p>
                            {usdtCost > 0 && (
                               <p className="mt-1 text-sm text-blue-600">
                                   Se usarán {bsBalance.toFixed(2)} Bs y se convertirán {usdtCost.toFixed(2)} USDT.
                               </p>
                            )}
                            {!hasSufficientBalance && amount && (
                                <p className="text-sm text-destructive mt-1">
                                    Saldo total insuficiente para este pago.
                                </p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={!amount || !billNumber || !service || isLoading || !hasSufficientBalance}>
                           {isLoading ? <Loader2 className="animate-spin" /> : 'Realizar Pago'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PagosPage;
