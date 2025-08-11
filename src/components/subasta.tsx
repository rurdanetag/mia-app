"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react';

interface SubastaPageProps {
    processTransaction: (newUsdtAmount: number, newBsAmount: number, transactionDetails: any) => Promise<boolean>;
    userBalance: number;
    bsBalance: number;
    bcvRates: { dolar: number, euro: number };
}

const SubastaPage = ({ processTransaction, userBalance, bsBalance, bcvRates }: SubastaPageProps) => {
    const [usdtAmount, setUsdtAmount] = useState('');
    const [bsAmount, setBsAmount] = useState('');
    const [rate, setRate] = useState(bcvRates.dolar.toFixed(2));
    const [isLoadingBuy, setIsLoadingBuy] = useState(false);
    const [isLoadingSell, setIsLoadingSell] = useState(false);

    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRate(e.target.value);
    };

    const handleBuyUSDT = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingBuy(true);
        const numericBsAmount = parseFloat(bsAmount);
        const numericRate = parseFloat(rate);
        if(!numericBsAmount || numericBsAmount <= 0 || !numericRate || numericRate <= 0) {
            setIsLoadingBuy(false);
            return;
        }
        
        const convertedUSDT = numericBsAmount / numericRate;
        
        const success = await processTransaction(
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
        setIsLoadingBuy(false);
    };

    const handleSellUSDT = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingSell(true);
        const numericUsdtAmount = parseFloat(usdtAmount);
        const numericRate = parseFloat(rate);
         if(!numericUsdtAmount || numericUsdtAmount <= 0 || !numericRate || numericRate <= 0) {
            setIsLoadingSell(false);
            return;
        }

        const convertedBs = numericUsdtAmount * numericRate;
        
        const success = await processTransaction(
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
        setIsLoadingSell(false);
    };

    const numericRate = parseFloat(rate);
    const rateDifference = Math.abs(numericRate - bcvRates.dolar) / bcvRates.dolar;
    const isValidRate = !isNaN(numericRate) && numericRate > 0 && rateDifference <= 0.10;
    const hasSufficientBs = bsBalance >= parseFloat(bsAmount || '0');
    const hasSufficientUsdt = userBalance >= parseFloat(usdtAmount || '0');

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold font-headline text-gray-800">Mercado de Subasta M.I.A.</h1>
                <p className="text-muted-foreground">Intercambia tus divisas de forma segura y transparente.</p>
            </div>

            <Card className="text-center shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-light">Tasa de Cambio (Bs/USDT)</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="relative">
                        <Label htmlFor="rate" className="sr-only">Tasa de Cambio</Label>
                        <Input
                            id="rate"
                            type="number"
                            step="0.01"
                            className="text-4xl sm:text-5xl font-extrabold tracking-wide mb-2 font-headline text-center h-auto bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            placeholder="0.00"
                            value={rate}
                            onChange={handleRateChange}
                        />
                     </div>
                    <p className="text-sm text-muted-foreground">
                        Tasa de referencia BCV: {bcvRates.dolar.toFixed(2)}
                    </p>
                    {rate && !isValidRate && (
                        <p className="text-destructive text-sm mt-2">
                           La tasa no puede desviarse más de un 10% de la tasa de referencia.
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
                                    required
                                />
                                {!hasSufficientBs && bsAmount && <p className="text-destructive text-sm mt-1">Saldo en Bolívares insuficiente.</p>}
                            </div>
                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={!isValidRate || !bsAmount || isLoadingBuy || !hasSufficientBs}>
                                {isLoadingBuy ? <Loader2 className="animate-spin" /> : 'Confirmar Compra'}
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
                                    required
                                />
                                {!hasSufficientUsdt && usdtAmount && <p className="text-destructive text-sm mt-1">Saldo en USDT insuficiente.</p>}
                            </div>
                            <Button type="submit" className="w-full" variant="destructive" disabled={!isValidRate || !usdtAmount || isLoadingSell || !hasSufficientUsdt}>
                                {isLoadingSell ? <Loader2 className="animate-spin" /> : 'Confirmar Venta'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SubastaPage;
