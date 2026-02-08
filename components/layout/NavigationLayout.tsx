"use client"

import * as React from "react"
import { Sidebar } from "./Sidebar"
import { BottomNav } from "./BottomNav"

export function NavigationLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden">
                <BottomNav />
            </div>

            {/* Main Content Area */}
            <main className="min-h-screen w-full transition-[padding] duration-300 md:pl-[72px] pb-24 md:pb-0">
                {children}
            </main>
        </>
    )
}
