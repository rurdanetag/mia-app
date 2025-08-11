"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

const AppHeader = () => {
    return (
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
                {/* Can add search or other header elements here */}
            </div>
        </header>
    );
}

export default AppHeader;
