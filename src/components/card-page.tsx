"use client";

import { useState } from 'react';
import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Comprobante from './comprobante';

interface CardPageProps {
    processTransaction: (newUsdtAmount: number, newBsAmount: number, transactionDetails: any) => boolean;
    userBalance: number;
    bsBalance: number;
    bcvRates: { dolar: number };
    lastTransaction: Transaction | null;
}

const CardPage = ({ processTransaction, userBalance, bsBalance, bcvRates, lastTransaction }: CardPageProps) => {
    const [amount, setAmount] = useState('');
    const [merchant, setMerchant] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        const usdtEquivalent = numericAmount / bcvRates.dolar;
        
        const success = processTransaction(
            userBalance - usdtEquivalent,
            bsBalance, // Assuming card payments are deducted from USDT via BS conversion at POS
            {
                type: 'Compra con Tarjeta',
                description: merchant || 'Comercio Local',
                amount: -numericAmount, // The charge is in BS
                currency: 'BS',
            }
        );
        
        if (success) {
            setAmount('');
            setMerchant('');
        }
    };
    
    const usdtEquivalentDisplay = amount ? (parseFloat(amount) / bcvRates.dolar).toFixed(2) : '0.00';

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
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Equivalente en USDT: <span className="font-bold text-primary">{usdtEquivalentDisplay} USDT</span>
                        </p>
                        <Button type="submit" className="w-full" disabled={!amount || !merchant}>
                            Pagar con Tarjeta
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CardPage;
