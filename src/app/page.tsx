"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Transaction } from '@/lib/types';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

import AppSidebar from '@/components/layout/sidebar';
import AppHeader from '@/components/layout/header';
import Dashboard from '@/components/dashboard';
import SubastaPage from '@/components/subasta';
import CardPage from '@/components/card-page';
import PagosPage from '@/components/pagos';
import RemesasPage from '@/components/remesas';
import RecargasPage from '@/components/recargas';
import Comprobante from '@/components/comprobante';

export type Page = 'home' | 'tarjeta' | 'remesas' | 'pagos' | 'subasta' | 'comprobante' | 'recargas';

export default function Home() {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [userBalance, setUserBalance] = useState(1500.75);
    const [bsBalance, setBsBalance] = useState(250000);
    const bcvRates = useMemo(() => ({
        dolar: 36.5,
        euro: 40.0,
    }), []);
    const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
    const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error'>('success');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            setTransactionHistory([
                { id: 'tx1', type: 'Remesa Recibida', description: 'De Juan Pérez', amount: 500.00, date: '2025-08-11', currency: 'USDT' },
                { id: 'tx2', type: 'Compra de USDT', description: 'Subasta M.I.A.', amount: 50.00, date: '2025-08-08', currency: 'USDT' },
                { id: 'tx3', type: 'Pago de Servicio', description: 'CANTV', amount: -500, date: '2025-08-10', currency: 'BS' },
                { id: 'tx4', type: 'Recarga Nacional', description: 'Desde Banco de Venezuela', amount: 100000, date: '2025-08-09', currency: 'BS' },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const processTransaction = async (newUsdtAmount: number, newBsAmount: number, transactionDetails: Omit<Transaction, 'id' | 'date'>): Promise<boolean> => {
        if (newUsdtAmount < 0 || newBsAmount < 0) {
            showErrorModal('¡Saldo insuficiente para completar la transacción!');
            return false;
        }

        setUserBalance(newUsdtAmount);
        setBsBalance(newBsAmount);

        const newTransaction: Transaction = {
            id: `tx${Date.now()}`,
            date: new Date().toISOString(),
            ...transactionDetails,
        };

        setTransactionHistory(prev => [newTransaction, ...prev]);
        showSuccessModal(`¡Transacción exitosa!`, newTransaction);
        return true;
    };
    
    const showSuccessModal = (message: string, transaction: Transaction) => {
        setModalMessage(message);
        setModalType('success');
        setLastTransaction(transaction);
        setShowModal(true);
    };

    const showErrorModal = (message: string) => {
        setModalMessage(message);
        setModalType('error');
        setShowModal(true);
    };

    const navigateTo = (page: Page) => {
        setCurrentPage(page);
        if (page !== 'comprobante') {
            setLastTransaction(null);
        }
    };
    
    const renderPage = () => {
        if (loading) {
             return (
                <div className="flex justify-center items-center h-screen">
                    <Loader2 className="h-16 w-16 text-primary animate-spin" />
                </div>
            );
        }

        switch (currentPage) {
            case 'tarjeta':
                return <CardPage bcvRates={bcvRates} processTransaction={processTransaction} userBalance={userBalance} bsBalance={bsBalance} />;
            case 'remesas':
                return <RemesasPage processTransaction={processTransaction} userBalance={userBalance} bsBalance={bsBalance} />;
            case 'pagos':
                return <PagosPage bcvRates={bcvRates} processTransaction={processTransaction} userBalance={userBalance} bsBalance={bsBalance} />;
            case 'subasta':
                return <SubastaPage bcvRates={bcvRates} processTransaction={processTransaction} userBalance={userBalance} bsBalance={bsBalance} />;
            case 'recargas':
                return <RecargasPage processTransaction={processTransaction} bsBalance={bsBalance} userBalance={userBalance}/>;
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
                                    const pagesThatGoToReceipt = ['recargas', 'pagos', 'tarjeta', 'subasta', 'remesas'];
                                    if (pagesThatGoToReceipt.includes(currentPage)){
                                       navigateTo('comprobante');
                                    }
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