"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Transaction } from '@/lib/types';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getAuth, onAuthStateChanged, User, signInAnonymously } from "firebase/auth";
import { app, db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, setDoc, collection, query, orderBy, addDoc, updateDoc } from "firebase/firestore";

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

const auth = getAuth(app);

export default function Home() {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [user, setUser] = useState<User | null>(null);
    const [userBalance, setUserBalance] = useState(1500.75); // Saldo en USDT (mantenido en estado local por ahora)
    const [bsBalance, setBsBalance] = useState(0); // Saldo en Bolívares (ahora desde Firestore)
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
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(false);
            } else {
                // Para fines de demostración, si no hay usuario, creamos uno anónimo
                try {
                    const userCredential = await signInAnonymously(auth);
                    setUser(userCredential.user);
                    // Comprobar si el nuevo usuario anónimo tiene un documento en Firestore
                    const userDocRef = doc(db, "users", userCredential.user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (!userDocSnap.exists()) {
                        // Si no existe, lo creamos con valores iniciales
                        await setDoc(userDocRef, { bsBalance: 250000 });
                    }
                } catch (error) {
                    console.error("Error signing in anonymously:", error);
                    showErrorModal('Error al inicializar sesión de usuario.');
                } finally {
                    setLoading(false);
                }
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (user) {
            // Listener para el saldo en Bolívares
            const userDocRef = doc(db, "users", user.uid);
            const unsubscribeBalance = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    setBsBalance(doc.data().bsBalance || 0);
                }
            }, (error) => {
                console.error("Error listening to balance changes:", error);
                showErrorModal("Error al obtener el saldo.");
            });

            // Listener para el historial de transacciones
            const transactionsColRef = collection(db, "users", user.uid, "transactions");
            const q = query(transactionsColRef, orderBy("date", "desc"));
            const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
                const firestoreTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
                // Combinar con transacciones locales de USDT
                setTransactionHistory(prev => {
                    const localTransactions = [
                        { id: 'local-1', type: 'Remesa Recibida', description: 'De Juan Pérez', amount: 500.00, date: '2025-08-11', currency: 'USDT' as const },
                        { id: 'local-2', type: 'Compra de USDT', description: 'Subasta M.I.A.', amount: 50.00, date: '2025-08-08', currency: 'USDT' as const },
                    ];
                    // Se asume que las transacciones de Firestore no son USDT para evitar duplicados.
                    const combined = [...firestoreTransactions, ...localTransactions];
                    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                });
            }, (error) => {
                console.error("Error listening to transaction changes:", error);
                showErrorModal("Error al obtener transacciones.");
            });
            
            return () => {
                unsubscribeBalance();
                unsubscribeTransactions();
            };
        }
    }, [user]);

    const processTransaction = async (newUsdtAmount: number, newBsAmount: number, transactionDetails: Omit<Transaction, 'id' | 'date'>): Promise<boolean> => {
        if (!user) {
            showErrorModal('Usuario no autenticado.');
            return false;
        }
        
        if (newUsdtAmount < 0 || newBsAmount < 0) {
            showErrorModal('¡Saldo insuficiente para completar la transacción!');
            return false;
        }

        try {
            // Actualizar balances
            setUserBalance(newUsdtAmount);
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, { bsBalance: newBsAmount });

            // Añadir transacción
            const newTransaction: Omit<Transaction, 'id'> = {
                date: new Date().toISOString(),
                ...transactionDetails,
            };
            const transactionsColRef = collection(db, "users", user.uid, "transactions");
            const docRef = await addDoc(transactionsColRef, newTransaction);
            
            showSuccessModal(`¡Transacción exitosa!`, { ...newTransaction, id: docRef.id });
            return true;
        } catch(error) {
            console.error("Error processing transaction:", error);
            showErrorModal("Error al procesar la transacción.");
            return false;
        }
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
        if (loading || !user) {
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
                return <RecargasPage userId={user.uid} showSuccessModal={showSuccessModal} showErrorModal={showErrorModal} />;
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
