"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CreditCard, Landmark } from 'lucide-react';

interface RecargasPageProps {
    processTransaction: (newUsdtAmount: number, newBsAmount: number, transactionDetails: any) => Promise<boolean>;
    userBalance: number;
    bsBalance: number;
}

const BankTransferForm = ({ processTransaction, userBalance, bsBalance }: RecargasPageProps) => {
    const [amount, setAmount] = useState('');
    const [bank, setBank] = useState('');
    const [reference, setReference] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const numericAmount = parseFloat(amount);
        
        const success = await processTransaction(
            userBalance,
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
    );
};

const CardRechargeForm = ({ processTransaction, userBalance, bsBalance }: RecargasPageProps) => {
    const [amount, setAmount] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const numericAmount = parseFloat(amount);

        const success = await processTransaction(
            userBalance,
            bsBalance + numericAmount,
            {
                type: 'Recarga con Tarjeta',
                description: `Tarjeta que termina en ${cardNumber.slice(-4)}`,
                amount: numericAmount,
                currency: 'BS',
            }
        );

        if (success) {
            setAmount('');
            setCardNumber('');
            setCardHolder('');
            setExpiry('');
            setCvc('');
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                <Input id="cardNumber" type="text" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="cardHolder">Nombre del Titular</Label>
                <Input id="cardHolder" type="text" placeholder="Juan Pérez" value={cardHolder} onChange={e => setCardHolder(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="expiry">Fecha de Vencimiento</Label>
                    <Input id="expiry" type="text" placeholder="MM/AA" value={expiry} onChange={e => setExpiry(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" type="text" placeholder="123" value={cvc} onChange={e => setCvc(e.target.value)} required />
                </div>
            </div>
            <div>
                <Label htmlFor="card-recarga-amount">Monto de la Recarga (Bs)</Label>
                <Input
                    id="card-recarga-amount"
                    type="number"
                    step="0.01"
                    className="mt-1"
                    placeholder="Ej: 500.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !amount || !cardNumber || !cardHolder || !expiry || !cvc}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Pagar y Recargar'}
            </Button>
        </form>
    );
};


const RecargasPage = (props: RecargasPageProps) => {
    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold font-headline text-gray-800">Recargar Saldo en Bolívares</h1>
                <p className="text-muted-foreground">Añade fondos a tu cuenta desde un banco o con tu tarjeta.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Reportar una Recarga</CardTitle>
                    <CardDescription>
                        Completa los detalles de tu transferencia o pago para que sea abonado a tu saldo (simulación).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="transferencia" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="transferencia">
                                <Landmark className="mr-2 h-4 w-4"/>
                                Transferencia
                            </TabsTrigger>
                            <TabsTrigger value="tarjeta">
                                <CreditCard className="mr-2 h-4 w-4"/>
                                Tarjeta Bancaria
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="transferencia" className="pt-4">
                            <BankTransferForm {...props} />
                        </TabsContent>
                        <TabsContent value="tarjeta" className="pt-4">
                           <CardRechargeForm {...props} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default RecargasPage;
