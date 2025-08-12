"use client";

import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarFooter, SidebarSeparator } from "@/components/ui/sidebar";
import { Landmark, LayoutDashboard, CreditCard, Send, HandCoins, Repeat, Power, Wallet, QrCode, Gift } from 'lucide-react';
import type { Page } from "@/app/page";

interface AppSidebarProps {
    navigateTo: (page: Page) => void;
    currentPage: Page;
    userBalance: number;
    bsBalance: number;
}

const AppSidebar = ({ navigateTo, currentPage, userBalance, bsBalance }: AppSidebarProps) => {
    const menuItems = [
        { page: 'home', label: 'Inicio', icon: LayoutDashboard },
        { page: 'tarjeta', label: 'Mi Tarjeta', icon: CreditCard },
        { page: 'remesas', label: 'Remesas', icon: Send },
        { page: 'pagos', label: 'Pagos', icon: HandCoins },
        { page: 'qr', label: 'Pagos QR', icon: QrCode },
        { page: 'subasta', label: 'Subasta', icon: Repeat },
        { page: 'recargas', label: 'Recargas', icon: Wallet },
        { page: 'referidos', label: 'Referidos', icon: Gift },
    ];

    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-lg">
                        <Landmark className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold font-headline text-primary">M.I.A.</h1>
                        <p className="text-xs text-muted-foreground">Billetera Digital</p>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-4">
                <div className="bg-card p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Saldo USDT</p>
                    <p className="text-2xl font-bold font-headline">${userBalance.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground mt-2">Saldo Bolívares</p>
                    <p className="text-lg font-semibold">Bs {bsBalance.toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>

                <SidebarMenu className="mt-4">
                    {menuItems.map(item => (
                        <SidebarMenuItem key={item.page}>
                            <SidebarMenuButton
                                onClick={() => navigateTo(item.page as Page)}
                                isActive={currentPage === item.page}
                                className="w-full justify-start"
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Power className="h-5 w-5" />
                            <span>Cerrar Sesión</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;
