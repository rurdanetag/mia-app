"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, QrCode, ScanLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QrPageProps {
    processTransaction: (newUsdtAmount: number, newBsAmount: number, transactionDetails: any) => Promise<boolean>;
    userBalance: number;
    bsBalance: number;
}

const MY_USER_ID = "mia-user-123"; // Simulated user ID for receiving payments

const GenerateQr = () => {
    const [amount, setAmount] = useState('');
    const [qrData, setQrData] = useState<string | null>(null);

    const handleGenerate = () => {
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) {
            setQrData(null);
            return;
        }
        const data = JSON.stringify({ userId: MY_USER_ID, amount: numericAmount });
        const encodedData = Buffer.from(data).toString('base64');
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(encodedData)}`;
        setQrData(qrUrl);
    };

    return (
        <div className="space-y-4 text-center">
            <div className='space-y-2'>
                <Label htmlFor="qr-amount">Monto a Recibir (USDT)</Label>
                <Input
                    id="qr-amount"
                    type="number"
                    step="0.01"
                    className="max-w-xs mx-auto"
                    placeholder="Ej: 50.00"
                    value={amount}
                    onChange={(e) => {
                        setAmount(e.target.value);
                        setQrData(null); // Reset QR on amount change
                    }}
                />
            </div>
            <Button onClick={handleGenerate} disabled={!amount}>Generar QR</Button>

            {qrData && (
                <div className="mt-6 flex flex-col items-center gap-4 animate-fade-in">
                    <p className="text-sm text-muted-foreground">Muestra este código para recibir el pago.</p>
                    <div className="p-4 bg-white rounded-lg shadow-md">
                        <Image src={qrData} alt="Código QR de pago" width={250} height={250} />
                    </div>
                </div>
            )}
        </div>
    );
};


const ScanQr = ({ processTransaction, userBalance, bsBalance }: QrPageProps) => {
    const [qrInput, setQrInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const decodedString = Buffer.from(qrInput, 'base64').toString('utf8');
            const { userId, amount } = JSON.parse(decodedString);

            if (!userId || !amount || typeof amount !== 'number' || amount <= 0) {
                throw new Error("Código QR inválido o corrupto.");
            }

            // Simulate the transaction
            const success = await processTransaction(
                userBalance - amount,
                bsBalance, // QR Payments are in USDT
                {
                    type: 'Pago QR Enviado',
                    description: `A usuario ${userId}`,
                    amount: -amount,
                    currency: 'USDT',
                }
            );

            if (success) {
                setQrInput('');
                // In a real app, you'd also create a "Pago QR Recibido" transaction for the other user.
            }

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error al procesar pago",
                description: "El código QR es inválido. Por favor, inténtalo de nuevo.",
            })
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-4">
             <p className="text-sm text-center text-muted-foreground">
                Pega el código del QR para simular el escaneo y realizar el pago.
            </p>
            <div>
                <Label htmlFor="qr-input">Datos del Código QR</Label>
                <Input
                    id="qr-input"
                    placeholder="Pega los datos del QR aquí"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                />
            </div>
            <Button onClick={handlePayment} disabled={!qrInput || isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Realizar Pago'}
            </Button>
        </div>
    );
};


const QrPage = (props: QrPageProps) => {
    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold font-headline text-gray-800">Pagos con QR</h1>
                <p className="text-muted-foreground">Envía y recibe pagos USDT de forma instantánea.</p>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Tabs defaultValue="receive" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="receive">
                                <QrCode className="mr-2 h-4 w-4"/>
                                Recibir Pago
                            </TabsTrigger>
                            <TabsTrigger value="send">
                                <ScanLine className="mr-2 h-4 w-4"/>
                                Realizar Pago
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="receive" className="pt-6">
                            <GenerateQr />
                        </TabsContent>
                        <TabsContent value="send" className="pt-6">
                           <ScanQr {...props} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default QrPage;
