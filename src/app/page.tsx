"use client";

import { useState, useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CheckCircle2, XCircle } from 'lucide-react';

import AppSidebar from '@/components/layout/sidebar';
import AppHeader from '@/components/layout/header';
import Dashboard from '@/components/dashboard';
import SubastaPage from '@/components/subasta';
import CardPage from '@/components/card-page';
import PagosPage from '@/components/pagos';
import RemesasPage from '@/components/remesas';
import Comprobante from '@/components/comprobante';

export type Page = 'home' | 'tarjeta' | 'remesas' | 'pagos' | 'subasta' | 'comprobante';

export default function Home() {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [userBalance, setUserBalance] = useState(1500.75); // Saldo en USDT
    const [bsBalance, setBsBalance] = useState(250000); // Saldo en Bolívares
    const bcvRates = useMemo(() => ({
        dolar: 36.5,
        euro: 40.0,
    }), []);
    const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([
        { id: 1, type: 'Remesa Recibida', description: 'De Juan Pérez', amount: 500.00, date: '2025-08-11', currency: 'USDT' },
        { id: 2, type: 'Pago de Servicio', description: 'Electricidad', amount: -926.50, date: '2025-08-10', currency: 'BS' },
        { id: 3, type: 'Compra con Tarjeta', description: 'Supermercado Central', amount: -2746.00, date: '2025-08-09', currency: 'BS' },
        { id: 4, type: 'Compra de USDT', description: 'Subasta M.I.A.', amount: 50.00, date: '2025-08-08', currency: 'USDT' },
    ]);
    const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error'>('success');

    const processTransaction = (newUsdtAmount: number, newBsAmount: number, transactionDetails: Omit<Transaction, 'id' | 'date'>) => {
        if (newUsdtAmount < 0 || newBsAmount < 0) {
            setModalMessage('¡Saldo insuficiente para completar la transacción!');
            setModalType('error');
            setShowModal(true);
            return false;
        }

        setUserBalance(newUsdtAmount);
        setBsBalance(newBsAmount);

        const newTransaction = {
            id: transactionHistory.length + 1,
            date: new Date().toISOString().slice(0, 10),
            ...transactionDetails,
        };
        setTransactionHistory(prev => [newTransaction, ...prev]);
        setLastTransaction(newTransaction);
        
        setModalMessage(`¡Transacción exitosa!`);
        setModalType('success');
        setShowModal(true);
        return true;
    };

    const navigateTo = (page: Page) => {
        setCurrentPage(page);
        if (page !== 'comprobante') {
            setLastTransaction(null);
        }
    };
    
    const renderPage = () => {
        switch (currentPage) {
            case 'tarjeta':
                return <CardPage bcvRates={bcvRates} processTransaction={processTransaction} userBalance={userBalance} bsBalance={bsBalance} lastTransaction={lastTransaction} />;
            case 'remesas':
                return <RemesasPage processTransaction={processTransaction} userBalance={userBalance} bsBalance={bsBalance} />;
            case 'pagos':
                return <PagosPage bcvRates={bcvRates} processTransaction={processTransaction} userBalance={userBalance} bsBalance={bsBalance} lastTransaction={lastTransaction} />;
            case 'subasta':
                return <SubastaPage bcvRates={bcvRates} processTransaction={processTransaction} userBalance={userBalance} bsBalance={bsBalance} />;
            case 'comprobante':
                return <Comprobante lastTransaction={lastTransaction} navigateTo={navigateTo} />;
            case 'home':
            default:
                return <Dashboard userBalance={userBalance} bsBalance={bsBalance} transactionHistory={transactionHistory} />;
        }
    };
    
    return (
        <SidebarProvider>
            <AppSidebar
                navigateTo={navigateTo}
                currentPage={currentPage}
                userBalance={userBalance}
                bsBalance={bsBalance}
            />
            <SidebarInset className="bg-background min-h-screen">
                <AppHeader />
                <main className="p-4 sm:p-6 lg:p-8">
                    {renderPage()}
                </main>
            </SidebarInset>
            
            <AlertDialog open={showModal} onOpenChange={setShowModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex justify-center mb-4">
                            {modalType === 'success' ? (
                                <CheckCircle2 className="h-16 w-16 text-green-500" />
                            ) : (
                                <XCircle className="h-16 w-16 text-red-500" />
                            )}
                        </div>
                        <AlertDialogTitle className="text-center text-xl">
                            {modalType === 'success' ? '¡Éxito!' : 'Error'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            {modalMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction 
                            className="w-full"
                            onClick={() => {
                                setShowModal(false);
                                if (modalType === 'success' && lastTransaction) {
                                    navigateTo('comprobante');
                                }
                            }}
                        >
                            Cerrar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SidebarProvider>
    );
}
