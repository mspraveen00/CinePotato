"use client"

import * as React from "react"
import { Sidebar } from "./Sidebar"
import { BottomNav } from "./BottomNav"

export function NavigationLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    // We need pathname to close menu on navigation
    // But Sidebar/BottomNav use usePathname themselves. We can just add a listener here or let Sidebar handle it.
    // Let's pass a close handler and let Sidebar call it, or we can listen to pathname changes here if we import usePathname.
    // Simpler: Sidebar is already using usePathname. We can add an effect in Sidebar to call onMobileClose when pathname changes.
    // OR: We do it here since we own the state.
    // Let's do it here for cleaner state management.

    // Actually, NavigationLayout doesn't import usePathname yet. Let's add it.
    // Wait, the original file didn't have usePathname.

    const closeMobileMenu = () => setIsMobileMenuOpen(false)
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

    return (
        <>
            {/* Desktop Sidebar & Mobile Sidebar (Responsive) */}
            <Sidebar
                mobileOpen={isMobileMenuOpen}
                onMobileClose={closeMobileMenu}
            />

            {/* Mobile Bottom Nav */}
            <div className="md:hidden">
                <BottomNav
                    onMenuClick={toggleMobileMenu}
                    isMenuOpen={isMobileMenuOpen}
                />
            </div>

            {/* Main Content Area */}
            <main className="min-h-screen w-full transition-[padding] duration-300 md:pl-[72px] pb-24 md:pb-0">
                {children}
            </main>
        </>
    )
}
