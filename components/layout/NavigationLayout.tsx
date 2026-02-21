"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { BottomNav } from "./BottomNav"

export function NavigationLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const pathname = usePathname()

    const closeMobileMenu = () => setIsMobileMenuOpen(false)
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

    // Check if we are on a title details page (movie, tv, game routes)
    const isTitlePage = pathname?.match(/^\/(movie|tv|game)\/[^\/]+$/)

    return (
        <>
            {/* Desktop Sidebar & Mobile Sidebar (Responsive) */}
            <Sidebar
                mobileOpen={isMobileMenuOpen}
                onMobileClose={closeMobileMenu}
                isTitlePage={!!isTitlePage}
            />

            {/* Mobile Bottom Nav */}
            {!isTitlePage && (
                <div className="md:hidden">
                    <BottomNav
                        onMenuClick={toggleMobileMenu}
                        isMenuOpen={isMobileMenuOpen}
                    />
                </div>
            )}

            {/* Main Content Area */}
            <main
                className={cn(
                    "min-h-screen w-full transition-[padding] duration-300",
                    isTitlePage ? "p-0" : "md:pl-[calc(64px+0.25rem)] pb-24 md:pb-0"
                )}
            >
                {children}
            </main>
        </>
    )
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}
