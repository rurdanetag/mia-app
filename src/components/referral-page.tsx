"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift, UserCheck, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from './ui/table';

const USER_REFERRAL_CODE = "MIA-USER-123";

const ReferralPage = () => {
    const { toast } = useToast();
    const [redeemCode, setRedeemCode] = useState('');
    const [isRedeemed, setIsRedeemed] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(USER_REFERRAL_CODE);
        toast({
            title: "¡Copiado!",
            description: "Tu código de referido ha sido copiado al portapapeles.",
        });
    };
    
    const handleRedeem = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple validation for simulation
        if (redeemCode.toUpperCase().startsWith("MIA-") && redeemCode.length > 4) {
            setIsRedeemed(true);
            toast({
                title: "¡Código Canjeado!",
                description: "El bono de 2 USDT se aplicará a ambas cuentas cuando el nuevo usuario sea verificado.",
            });
        } else {
             toast({
                variant: "destructive",
                title: "Código Inválido",
                description: "El código de referido que ingresaste no es válido.",
            });
        }
    }

    const simulatedReferredUsers = [
        { id: 1, name: 'Juan Pérez', status: 'verified' as const, date: '2025-08-01' },
        { id: 2, name: 'Maria Rodriguez', status: 'pending' as const, date: '2025-08-10' },
        { id: 3, name: 'Carlos Gomez', status: 'pending' as const, date: '2025-08-12' },
    ];
    
    const totalEarnings = simulatedReferredUsers.filter(u => u.status === 'verified').length * 2;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold font-headline text-gray-800">Sistema de Referidos</h1>
                <p className="text-muted-foreground">Invita a tus amigos y gana recompensas.</p>
            </div>
            
            <Card className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Gift /> Tu Bono de Bienvenida</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p>
                        ¡Gana <strong>2 USDT</strong> por cada amigo que invites! Tu amigo también recibirá <strong>2 USDT</strong> de bienvenida.
                    </p>
                    <p className="text-xs text-primary-foreground/80">
                        El bono se acredita a ambas cuentas cuando el usuario referido realiza su primera transacción (simulación de verificación).
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Tu Código de Referido</CardTitle>
                        <CardDescription>Comparte este código con tus amigos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Input value={USER_REFERRAL_CODE} readOnly className="font-mono text-lg" />
                            <Button variant="outline" size="icon" onClick={copyToClipboard}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>¿Te invitaron?</CardTitle>
                        <CardDescription>Ingresa el código que te dieron.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRedeem} className="flex items-center space-x-2">
                            <Input 
                                placeholder="Ingresa un código" 
                                value={redeemCode}
                                onChange={(e) => setRedeemCode(e.target.value)}
                                disabled={isRedeemed}
                            />
                            <Button type="submit" disabled={!redeemCode || isRedeemed}>
                                {isRedeemed ? <CheckCircle2 /> : 'Canjear'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Referidos</CardTitle>
                    <CardDescription>
                        Has ganado un total de <span className="font-bold text-primary">${totalEarnings.toFixed(2)} USDT</span> en bonos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Fecha de Registro</TableHead>
                                <TableHead className="text-right">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {simulatedReferredUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{new Date(user.date).toLocaleDateString('es-VE')}</TableCell>
                                    <TableCell className="text-right">
                                        {user.status === 'verified' ? (
                                            <Badge className="bg-green-100 text-green-800 border-green-200">
                                                <UserCheck className="mr-1 h-3 w-3" />
                                                Verificado
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                <Clock className="mr-1 h-3 w-3" />
                                                Pendiente
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReferralPage;
