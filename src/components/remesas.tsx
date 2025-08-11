"use client";

import { useState } from 'react';
import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";

interface RemesasPageProps {
    processTransaction: (newUsdtAmount: number, newBsAmount: number, transactionDetails: any) => Promise<boolean>;
    userBalance: number;
    bsBalance: number;
}

const RemesasPage = ({ processTransaction, userBalance, bsBalance }: RemesasPageProps) => {
    const [step, setStep] = useState<'form' | 'confirm' | 'result'>('form');
    const [remesaData, setRemesaData] = useState({ recipientUser: '', amountToSend: '', paymentMethod: 'app-balance' });
    const [cardData, setCardData] = useState({ cardNumber: '', cardHolder: '', expiry: '', cvc: '' });
    const [bankData, setBankData] = useState({ bankName: '', accountNumber: '', accountHolder: '' });
    const [saveDetails, setSaveDetails] = useState(false);
    
    const recipientInfo = { name: 'Ana García', document: 'V-12.345.678', email: 'ana.garcia@email.com' };
    const [amountReceived, setAmountReceived] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRemesaData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(remesaData.amountToSend);
        if (!numericAmount || numericAmount <= 0 || numericAmount > userBalance) return;
        
        const commissionRate = remesaData.paymentMethod === 'app-balance' ? 0 : 0.01;
        const commission = numericAmount * commissionRate;
        const finalAmount = numericAmount - commission;
        setAmountReceived(finalAmount);
        setStep('confirm');
    };

    const handleConfirm = async () => {
        const numericAmount = parseFloat(remesaData.amountToSend);
        const success = await processTransaction(
            userBalance - numericAmount,
            bsBalance, // Remesas no afectan el saldo en BS directamente
            {
                type: 'Remesa Enviada',
                description: `A ${recipientInfo.name} | Método: ${remesaData.paymentMethod === 'app-balance' ? 'Saldo App' : 'Externo'}`,
                amount: -numericAmount,
                currency: 'USDT',
            }
        );
        if (success) {
            setStep('result');
        }
    };
    
    const resetForm = () => {
        setRemesaData({ recipientUser: '', amountToSend: '', paymentMethod: 'app-balance' });
        setStep('form');
    }

    const renderForm = () => (
        <Card>
            <CardHeader>
                <CardTitle>Enviar Remesa</CardTitle>
                <CardDescription>Completa los datos para enviar dinero a otro usuario de M.I.A.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="recipientUser">Usuario del Beneficiario</Label>
                        <Input id="recipientUser" name="recipientUser" placeholder="Ej: AnaGarcia123" value={remesaData.recipientUser} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="amountToSend">Monto a Enviar (USDT)</Label>
                        <Input id="amountToSend" name="amountToSend" type="number" step="0.01" placeholder="Ej: 100.00" value={remesaData.amountToSend} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label className="mb-2 block">Método de Pago</Label>
                        <RadioGroup name="paymentMethod" value={remesaData.paymentMethod} onValueChange={(value) => setRemesaData(prev => ({...prev, paymentMethod: value}))} className="space-y-2">
                           {['app-balance', 'card', 'bank-transfer'].map(method => (
                               <Label key={method} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-secondary has-[:checked]:bg-secondary has-[:checked]:border-primary">
                                   <RadioGroupItem value={method} id={method} disabled={method !== 'app-balance'}/>
                                   <span className="ml-3 text-sm font-medium">{
                                       { 'app-balance': 'Saldo en la App (sin comisión)', 'card': 'Tarjeta de Crédito/Débito (1% comisión) - No disponible', 'bank-transfer': 'Transferencia Bancaria (1% comisión) - No disponible' }[method]
                                   }</span>
                               </Label>
                           ))}
                        </RadioGroup>
                    </div>
                    <Button type="submit" className="w-full" disabled={!remesaData.amountToSend || !remesaData.recipientUser || parseFloat(remesaData.amountToSend) > userBalance}>
                        {parseFloat(remesaData.amountToSend) > userBalance ? 'Saldo USDT Insuficiente' : <>Enviar Remesa <ArrowRight className="ml-2 h-4 w-4" /></>}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );

    const renderConfirm = () => (
        <Card>
            <CardHeader>
                <CardTitle className="text-center">Confirmar Transacción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-secondary p-4 rounded-lg text-sm text-secondary-foreground">
                    Verifica que los datos del beneficiario sean correctos antes de confirmar.
                </div>
                <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between"><span className="text-muted-foreground">Beneficiario:</span><span className="font-semibold">{recipientInfo.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Documento:</span><span className="font-semibold">{recipientInfo.document}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Monto Enviado:</span><span className="font-semibold">${parseFloat(remesaData.amountToSend).toFixed(2)} USDT</span></div>
                    <div className="flex justify-between text-base"><span className="text-muted-foreground">Monto a Recibir:</span><span className="font-bold text-green-600">${amountReceived.toFixed(2)} USDT</span></div>
                </div>
                <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={() => setStep('form')} className="w-full">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                    </Button>
                    <Button onClick={handleConfirm} className="w-full bg-green-600 hover:bg-green-700">
                        Confirmar Envío
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const renderResult = () => (
        <Card>
            <CardContent className="text-center p-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">¡Transacción Exitosa!</h2>
                <p className="text-muted-foreground mb-6">
                    La remesa ha sido enviada con éxito.
                </p>
                <Button onClick={resetForm} className="w-full">
                    Enviar otra Remesa
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline text-gray-800">Enviar Remesas con M.I.A.</h1>
            </div>
            {step === 'form' && renderForm()}
            {step === 'confirm' && renderConfirm()}
            {step === 'result' && renderResult()}
        </div>
    );
};

export default RemesasPage;
