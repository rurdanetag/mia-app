"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

interface RecargasPageProps {
    processTransaction: (newUsdtAmount: number, newBsAmount: number, transactionDetails: any) => Promise<boolean>;
    userBalance: number;
    bsBalance: number;
}

const RecargasPage = ({ processTransaction, bsBalance, userBalance }: RecargasPageProps) => {
    const [amount, setAmount] = useState('');
    const [bank, setBank] = useState('');
    const [reference, setReference] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const numericAmount = parseFloat(amount);
        
        const success = await processTransaction(
            userBalance, // El saldo en USDT no cambia
            bsBalance + numericAmount,
            {
                type: 'Recarga Nacional',
                description: `Desde ${bank || 'banco'} | Ref: ${reference || 'N/A'}`,
                amount: numericAmount,
                currency: 'BS',
            }
        );

        if (success) {
            setAmount('');
            setBank('');
            setReference('');
        }
        setIsLoading(false);
    };
    
    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline text-gray-800">Recargar Saldo en Bolívares</h1>
                <p className="text-muted-foreground">Añade fondos a tu cuenta desde un banco nacional.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Reportar una Recarga</CardTitle>
                    <CardDescription>
                        Completa los detalles de tu transferencia para que sea abonada a tu saldo (simulación).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="bank">Banco de Origen</Label>
                             <Select value={bank} onValueChange={setBank} required>
                                <SelectTrigger id="bank" className="w-full mt-1">
                                    <SelectValue placeholder="Seleccione un banco" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="banco-de-venezuela">Banco de Venezuela</SelectItem>
                                    <SelectItem value="banco-provincial">Banco Provincial</SelectItem>
                                    <SelectItem value="banco-mercantil">Banco Mercantil</SelectItem>
                                    <SelectItem value="banesco">Banesco</SelectItem>
                                    <SelectItem value="otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="reference">Número de Referencia</Label>
                            <Input
                                id="reference"
                                type="text"
                                className="mt-1"
                                placeholder="Ej: 00123456"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="recarga-amount">Monto de la Recarga (Bs)</Label>
                            <Input
                                id="recarga-amount"
                                type="number"
                                step="0.01"
                                className="mt-1"
                                placeholder="Ej: 500.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || !amount || !bank || !reference}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar Recarga'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default RecargasPage;