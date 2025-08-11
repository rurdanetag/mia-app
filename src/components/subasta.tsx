"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowDown, ArrowUp } from 'lucide-react';

interface SubastaPageProps {
    processTransaction: (newUsdtAmount: number, newBsAmount: number, transactionDetails: any) => boolean;
    userBalance: number;
    bsBalance: number;
    bcvRates: { dolar: number, euro: number };
}

const SubastaPage = ({ processTransaction, userBalance, bsBalance, bcvRates }: SubastaPageProps) => {
    const [usdtAmount, setUsdtAmount] = useState('');
    const [bsAmount, setBsAmount] = useState('');
    const [rate, setRate] = useState(bcvRates.dolar.toFixed(2));

    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRate(e.target.value);
    };

    const handleBuyUSDT = (e: React.FormEvent) => {
        e.preventDefault();
        const numericBsAmount = parseFloat(bsAmount);
        const numericRate = parseFloat(rate);
        
        const convertedUSDT = numericBsAmount / numericRate;
        
        const success = processTransaction(
            userBalance + convertedUSDT,
            bsBalance - numericBsAmount,
            {
                type: 'Compra de USDT',
                description: `Subasta a ${numericRate.toFixed(2)} Bs/USDT`,
                amount: convertedUSDT,
                currency: 'USDT',
            }
        );
        if(success) setBsAmount('');
    };

    const handleSellUSDT = (e: React.FormEvent) => {
        e.preventDefault();
        const numericUsdtAmount = parseFloat(usdtAmount);
        const numericRate = parseFloat(rate);
        const convertedBs = numericUsdtAmount * numericRate;
        
        const success = processTransaction(
            userBalance - numericUsdtAmount,
            bsBalance + convertedBs,
            {
                type: 'Venta de USDT',
                description: `Subasta a ${numericRate.toFixed(2)} Bs/USDT`,
                amount: -numericUsdtAmount,
                currency: 'USDT',
            }
        );
        if(success) setUsdtAmount('');
    };

    const isValidRate = !isNaN(parseFloat(rate)) && parseFloat(rate) >= bcvRates.dolar && parseFloat(rate) <= bcvRates.euro;
    const isInvalidAndNotEmpty = !isValidRate && rate !== '';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline text-gray-800">Mercado de Subasta M.I.A.</h1>
                <p className="text-muted-foreground">Intercambia tus divisas de forma segura y transparente.</p>
            </div>

            <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-center shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-light">Tasa de Cambio (Bs/USDT)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-5xl font-extrabold tracking-wide mb-2 font-headline">
                        {rate === '' ? '---' : parseFloat(rate).toFixed(2)}
                    </p>
                    <p className="text-sm text-primary-foreground/80">
                        Piso: Bs {bcvRates.dolar.toFixed(2)} | Techo: Bs {bcvRates.euro.toFixed(2)}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Modificar Tasa de Subasta</CardTitle>
                    <CardDescription>Ajusta la tasa de cambio dentro del rango oficial.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Label htmlFor="rate">Tasa de Cambio</Label>
                    <Input
                        id="rate"
                        type="number"
                        step="0.01"
                        className={`mt-1 ${isInvalidAndNotEmpty ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        placeholder={`Tasa entre ${bcvRates.dolar.toFixed(2)} y ${bcvRates.euro.toFixed(2)}`}
                        value={rate}
                        onChange={handleRateChange}
                    />
                    {isInvalidAndNotEmpty && (
                        <p className="text-destructive text-sm mt-2 animate-pulse">
                            La tasa está fuera del rango permitido.
                        </p>
                    )}
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-green-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <ArrowUp className="h-6 w-6" /> Comprar USDT
                        </CardTitle>
                        <CardDescription>Cambia tus Bolívares por USDT.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleBuyUSDT} className="space-y-4">
                            <div>
                                <Label htmlFor="bsAmount">Monto en Bolívares (Bs)</Label>
                                <Input
                                    id="bsAmount"
                                    type="number"
                                    step="0.01"
                                    placeholder="Ej: 1000.00"
                                    value={bsAmount}
                                    onChange={(e) => setBsAmount(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={!isValidRate || !bsAmount}>
                                Confirmar Compra
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-red-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <ArrowDown className="h-6 w-6" /> Vender USDT
                        </CardTitle>
                        <CardDescription>Cambia tus USDT por Bolívares.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSellUSDT} className="space-y-4">
                            <div>
                                <Label htmlFor="usdtAmount">Monto en USDT</Label>
                                <Input
                                    id="usdtAmount"
                                    type="number"
                                    step="0.01"
                                    placeholder="Ej: 50.00"
                                    value={usdtAmount}
                                    onChange={(e) => setUsdtAmount(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full" variant="destructive" disabled={!isValidRate || !usdtAmount}>
                                Confirmar Venta
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SubastaPage;
