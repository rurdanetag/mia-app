"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, runTransaction, collection, addDoc } from 'firebase/firestore';

interface RecargasPageProps {
    userId: string;
    showSuccessModal: (message: string, transaction: Transaction) => void;
    showErrorModal: (message: string) => void;
}

const RecargasPage = ({ userId, showSuccessModal, showErrorModal }: RecargasPageProps) => {
    const [amount, setAmount] = useState('');
    const [bank, setBank] = useState('');
    const [reference, setReference] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) {
            showErrorModal("Por favor, introduce un monto válido.");
            return;
        }
        if (!bank || !reference) {
            showErrorModal("Por favor, completa todos los campos del formulario.");
            return;
        }

        setIsLoading(true);

        try {
            const userDocRef = doc(db, 'users', userId);
            const transactionsColRef = collection(db, 'users', userId, 'transactions');

            // Using a transaction to ensure atomicity
            const newTransaction = await runTransaction(db, async (firestoreTransaction) => {
                const userDoc = await firestoreTransaction.get(userDocRef);
                if (!userDoc.exists()) {
                    throw new Error("El documento del usuario no existe.");
                }

                const currentBalance = userDoc.data().bsBalance || 0;
                const newBalance = currentBalance + numericAmount;
                
                firestoreTransaction.update(userDocRef, { bsBalance: newBalance });

                const transactionData = {
                    type: 'Recarga Nacional',
                    description: `Desde ${bank} | Ref: ${reference}`,
                    amount: numericAmount,
                    currency: 'BS' as 'BS',
                    date: new Date().toISOString(),
                };
                
                const newTransactionRef = await addDoc(transactionsColRef, transactionData);
                return { ...transactionData, id: newTransactionRef.id };
            });

            showSuccessModal('¡Recarga exitosa!', newTransaction);
            setAmount('');
            setBank('');
            setReference('');

        } catch (error) {
            console.error("Error al procesar la recarga:", error);
            const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
            showErrorModal(`Error al procesar la recarga: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
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
                        Completa los detalles de tu transferencia para que sea abonada a tu saldo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="bank">Banco de Origen</Label>
                             <Select value={bank} onValueChange={setBank}>
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
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar Recarga'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default RecargasPage;