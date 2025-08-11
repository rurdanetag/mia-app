"use client";

import { useState } from 'react';
import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from './ui/alert';
import { Info, CheckCircle, PartyPopper, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast"

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
    const { toast } = useToast();

    // State for the request card form
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [requestStep, setRequestStep] = useState<'form' | 'success'>('form');
    const [requestData, setRequestData] = useState({ country: '', state: '', city: '', bank: '' });
    const [solicitudeNumber, setSolicitudeNumber] = useState('');

    const handleRequestDataChange = (field: keyof typeof requestData, value: string) => {
        const newData = { ...requestData, [field]: value };
        if (field === 'country' && value !== 'Venezuela') {
            newData.bank = '';
        }
        setRequestData(newData);
    };

    const handleRequestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newSolicitudeNumber = `MIA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        setSolicitudeNumber(newSolicitudeNumber);
        setRequestStep('success');
    };

    const resetRequestForm = () => {
        setRequestData({ country: '', state: '', city: '', bank: '' });
        setRequestStep('form');
        setIsFormOpen(false);
    }
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(solicitudeNumber);
        toast({
          title: "¡Copiado!",
          description: "Número de solicitud copiado al portapapeles.",
        })
    }


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
                amount: -usdtEquivalent, // Se registra el gasto en USDT
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
    const isRequestFormValid = requestData.country && requestData.state && requestData.city && requestData.bank;

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold font-headline text-gray-800">Mi Tarjeta de Débito M.I.A.</h1>
            </div>
            
             {/* Premium Card Design */}
            <div className="relative bg-black text-white w-full aspect-[1.586] rounded-xl shadow-2xl flex flex-col justify-between p-4 sm:p-6 transform transition-transform duration-500 hover:scale-105 overflow-hidden group">
                 {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                 {/* World Map Background */}
                <div 
                    className="absolute inset-0 bg-center bg-cover opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ backgroundImage: "url('https://www.svgrepo.com/show/509206/world-map.svg')" }}
                ></div>

                <div className="relative z-10 flex justify-between items-start">
                     {/* M.I.A. Logo with relief */}
                    <h2 className="text-2xl sm:text-3xl font-bold font-headline" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5), 0px 0px 1px rgba(255,255,255,0.3)' }}>M.I.A</h2>

                    {/* Chip */}
                    <div className="w-10 sm:w-12 h-8 sm:h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-md shadow-inner">
                        <div className="w-full h-full border border-gray-500/50 rounded-md grid grid-cols-2 gap-px p-1">
                            <div className="border-r border-b border-gray-500/50"></div>
                            <div className="border-b border-gray-500/50"></div>
                            <div className="border-r border-gray-500/50"></div>
                            <div></div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-center">
                    <p className="font-mono text-xl sm:text-3xl tracking-widest" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>
                        4242 1234 5678 9010
                    </p>
                </div>
                
                <div className="relative z-10 flex justify-between items-end" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>
                    <div>
                        <p className="text-xs opacity-70 tracking-wider">TITULAR</p>
                        <p className="font-medium tracking-wider text-sm sm:text-base">USUARIO DE M.I.A.</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-8 sm:w-9 h-5 sm:h-6 relative">
                            <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-red-600/80 absolute right-0"></div>
                            <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-yellow-500/80 absolute left-0 mix-blend-screen"></div>
                        </div>
                        <p className="font-semibold text-xs sm:text-sm">mastercard</p>
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

            <Card>
                <CardHeader>
                    <CardTitle>Solicitar Tarjeta Física</CardTitle>
                    <CardDescription>Recibe tu tarjeta M.I.A. y úsala en cualquier parte del mundo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                           La solicitud de tu primera tarjeta M.I.A. es <strong>gratuita</strong>. Las renovaciones o reemplazos tendrán un costo de 5 USDT, que se debitarán de tu saldo.
                        </AlertDescription>
                    </Alert>
                    <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) { resetRequestForm(); } setIsFormOpen(open); }}>
                        <DialogTrigger asChild>
                            <Button className="w-full" onClick={() => setIsFormOpen(true)}>
                               Solicitar Tarjeta
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            {requestStep === 'form' && (
                                <>
                                    <DialogHeader>
                                        <DialogTitle>Formulario de Solicitud</DialogTitle>
                                        <DialogDescription>
                                            Completa tus datos para coordinar la entrega de tu tarjeta.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleRequestSubmit}>
                                        <div className="space-y-4 py-4">
                                            <div>
                                                <Label htmlFor="country">País</Label>
                                                <Select value={requestData.country} onValueChange={(value) => handleRequestDataChange('country', value)} required>
                                                    <SelectTrigger id="country"><SelectValue placeholder="Seleccione un país" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Venezuela">Venezuela</SelectItem>
                                                        <SelectItem value="Colombia">Colombia</SelectItem>
                                                        <SelectItem value="Otro">Otro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="state">Estado / Provincia</Label>
                                                <Input id="state" value={requestData.state} onChange={(e) => handleRequestDataChange('state', e.target.value)} placeholder="Ej: Miranda" required />
                                            </div>
                                             <div>
                                                <Label htmlFor="city">Ciudad</Label>
                                                <Input id="city" value={requestData.city} onChange={(e) => handleRequestDataChange('city', e.target.value)} placeholder="Ej: Caracas" required />
                                            </div>
                                            <div>
                                                <Label htmlFor="bank">Banco para retirar</Label>
                                                <Select value={requestData.bank} onValueChange={(value) => handleRequestDataChange('bank', value)} required>
                                                    <SelectTrigger id="bank"><SelectValue placeholder="Seleccione un banco" /></SelectTrigger>
                                                    <SelectContent>
                                                        {requestData.country === 'Venezuela' ? (
                                                            <>
                                                                <SelectItem value="banco-de-venezuela">Banco de Venezuela</SelectItem>
                                                                <SelectItem value="bancamiga">Bancamiga</SelectItem>
                                                            </>
                                                        ) : (
                                                            <SelectItem value="retiro-internacional" disabled={!requestData.country}>
                                                                {requestData.country ? 'Agencia Internacional Aliada' : 'Seleccione un país primero'}
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={!isRequestFormValid}>Generar Solicitud</Button>
                                        </DialogFooter>
                                    </form>
                                </>
                            )}
                            {requestStep === 'success' && (
                                <>
                                    <DialogHeader className="text-center items-center">
                                         <PartyPopper className="h-16 w-16 text-primary" />
                                        <DialogTitle>¡Solicitud Generada con Éxito!</DialogTitle>
                                        <DialogDescription>
                                            Guarda tu número de solicitud. Te contactaremos pronto para coordinar la entrega.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Label htmlFor='solicitude-number'>Número de Solicitud</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input id="solicitude-number" value={solicitudeNumber} readOnly />
                                            <Button variant="outline" size="icon" onClick={copyToClipboard}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={resetRequestForm}>Finalizar</Button>
                                    </DialogFooter>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
};

export default CardPage;
