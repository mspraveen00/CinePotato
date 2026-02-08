"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Search, User, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
    const pathname = usePathname()
    const [isVisible, setIsVisible] = React.useState(true)
    const [lastScrollY, setLastScrollY] = React.useState(0)

    // Scroll listener for auto-hide
    React.useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY

            // Show if scrolling up or at top
            // Hide if scrolling down and not at top
            if (currentScrollY > lastScrollY && currentScrollY > 20) {
                setIsVisible(false)
            } else {
                setIsVisible(true)
            }

            setLastScrollY(currentScrollY)
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [lastScrollY])

    const navItems = [
        { href: "/explore", icon: Compass, label: "Explore" },
        { href: "/search", icon: Search, label: "Search" },
        { href: "/user", icon: User, label: "User" },
        { href: "#menu", icon: Menu, label: "Menu" }, // Menu placeholder for now
    ]

    return (
        <div
            className={cn(
                "fixed bottom-6 left-1/2 z-50 -translate-x-1/2", // Centered, floating
                "w-[90vw] max-w-sm rounded-2xl", // Dock shape
                "bg-black/20 backdrop-blur-xl border border-white/10", // Glassmorphism
                "transition-transform duration-300 ease-in-out",
                isVisible ? "translate-y-0" : "translate-y-[200%]" // Slide out/in
            )}
        >
            <nav className="flex items-center justify-around p-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-xl transition-colors",
                                isActive ? "text-blue-400 bg-white/5" : "text-muted-foreground hover:bg-white/5"
                            )}
                        >
                            <item.icon size={24} />
                            {/* Optional: No labels on bottom nav often looks cleaner, 
                  but prompt implies 4 items. Let's keep icons prominent. 
                  Maybe small labels if needed. Prompt didn't specify labels for bottom nav.
                  "Contains exactly 4 items in this order: Explore, Search, User, Menu"
              */}
                            <span className="text-[10px] font-medium mt-1">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
