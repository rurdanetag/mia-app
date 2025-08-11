"use client";

import { useState } from 'react';
import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface CardPageProps {
    processTransaction: (newUsdtAmount: number, newBsAmount: number, transactionDetails: any) => Promise<boolean>;
    userBalance: number;
    bsBalance: number;
    bcvRates: { dolar: number };
}

const CardPage = ({ processTransaction, userBalance, bsBalance, bcvRates }: CardPageProps) => {
    const [amount, setAmount] = useState('');
    const [merchant, setMerchant] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const numericAmount = parseFloat(amount);
        if(!numericAmount || numericAmount <= 0) {
            setIsLoading(false);
            return;
        }

        const usdtEquivalent = numericAmount / bcvRates.dolar;
        
        const success = await processTransaction(
            userBalance - usdtEquivalent,
            bsBalance, // Los pagos con tarjeta se descuentan del saldo USDT.
            {
                type: 'Compra con Tarjeta',
                description: `Pago en ${merchant || 'Comercio Local'}`,
                amount: usdtEquivalent, // Se registra el gasto en USDT
                currency: 'USDT',
            }
        );
        
        if (success) {
            setAmount('');
            setMerchant('');
        }
        setIsLoading(false);
    };
    
    const usdtEquivalentDisplay = amount ? (parseFloat(amount) / bcvRates.dolar).toFixed(2) : '0.00';
    const hasSufficientBalance = userBalance >= parseFloat(usdtEquivalentDisplay);

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline text-gray-800">Mi Tarjeta de Débito M.I.A.</h1>
            </div>
            <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                <p className="text-sm opacity-80">Número de Tarjeta (Ficticio)</p>
                <p className="font-mono text-2xl tracking-widest mt-2 mb-4">4242 1234 5678 9010</p>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm opacity-80">Titular</p>
                        <p className="font-bold">Usuario de M.I.A.</p>
                    </div>
                    <div>
                        <p className="text-sm opacity-80">Válido hasta</p>
                        <p className="font-bold">12/28</p>
                    </div>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Simular un Pago</CardTitle>
                    <CardDescription>Los pagos se debitan de tu saldo en USDT convirtiendo el monto en Bolívares a la tasa oficial.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="merchant">Comercio</Label>
                            <Input
                                id="merchant"
                                type="text"
                                className="mt-1"
                                placeholder="Ej: Supermercado El Éxito"
                                value={merchant}
                                onChange={(e) => setMerchant(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="amount">Monto a Pagar (Bs)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                className="mt-1"
                                placeholder="Ej: 2500.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Equivalente a debitar: <span className="font-bold text-primary">{usdtEquivalentDisplay} USDT</span>
                        </p>
                         {!hasSufficientBalance && amount && (
                            <p className="text-sm text-destructive">
                                Saldo en USDT insuficiente.
                            </p>
                        )}
                        <Button type="submit" className="w-full" disabled={!amount || !merchant || isLoading || !hasSufficientBalance}>
                            {isLoading ? 'Procesando...' : 'Pagar con Tarjeta'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CardPage;
