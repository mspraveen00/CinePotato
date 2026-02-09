"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Search, User, Menu, Settings, Info, CircleUser } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
    mobileOpen?: boolean
    onMobileClose?: () => void
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
    const pathname = usePathname()
    const [isHovered, setIsHovered] = React.useState(false)
    const [isPinned, setIsPinned] = React.useState(false)

    // Combined expanded state
    const isExpanded = isHovered || isPinned

    // Toggle pin state
    const togglePin = () => setIsPinned(!isPinned)

    // Scroll Lock Effect
    React.useEffect(() => {
        // Lock scroll if:
        // 1. Mobile menu is open
        // 2. Desktop menu is expanded (hovered or pinned)
        const shouldLock = mobileOpen || (isExpanded && window.innerWidth >= 768)

        if (shouldLock) {
            const originalStyle = window.getComputedStyle(document.body).overflow
            document.body.style.overflow = "hidden"
            return () => {
                document.body.style.overflow = originalStyle
            }
        }
    }, [mobileOpen, isExpanded])

    // Close mobile (and reset states) on path change
    React.useEffect(() => {
        if (mobileOpen && onMobileClose) {
            onMobileClose()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname])

    // Primary navigation items
    const navItems = [
        { href: "/explore", icon: Compass, label: "Explore" },
        { href: "/search", icon: Search, label: "Search" },
        { href: "/user", icon: User, label: "User" },
    ]

    // Secondary items (only visible when expanded)
    const expandedItems = [
        { href: "/explore", icon: Compass, label: "Explore" },
        { href: "/search", icon: Search, label: "Search" },
        { href: "/user", icon: User, label: "User" },
        { type: "divider" },
        { href: "/settings", icon: Settings, label: "Settings" },
        { href: "/account", icon: CircleUser, label: "Account" },
        { href: "/about", icon: Info, label: "About" },
    ]

    return (
        <>
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={onMobileClose}
                    aria-hidden="true"
                />
            )}

            {/* 
                Sidebar Container 
                Adapted for both Mobile and Desktop
            */}
            <aside
                className={cn(
                    // Common styles
                    "fixed z-50 flex h-screen flex-col border-r border-white/10 bg-black/20 backdrop-blur-xl transition-[width,transform] duration-300 ease-in-out will-change-[width,transform]",

                    // Desktop Styles (md:...)
                    "md:left-0 md:top-0 md:translate-x-0 md:border-r",
                    isExpanded ? "md:w-64" : "md:w-[72px]",

                    // Mobile Styles (default, overwritten by md:)
                    "top-0 right-0 w-64 border-l border-white/10", // Mobile: Right side, fixed width
                    mobileOpen ? "translate-x-0" : "translate-x-full", // Slide in/out
                    "md:translate-x-0" // Reset transform on desktop should be implied
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Header / Menu Toggle */}
                <div className="flex h-16 items-center px-4 justify-between md:justify-start">
                    <button
                        onClick={togglePin}
                        className={cn(
                            "hidden md:flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10 transition-colors",
                            isPinned && "bg-white/10 text-primary" // Highlight if pinned
                        )}
                        aria-label="Toggle Menu"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Mobile Close Button / Menu Label */}
                    <div className="flex md:hidden w-full items-center pl-2">
                        <span className="text-lg font-semibold">Menu</span>
                    </div>

                    {/* Label only visible when expanded on Desktop */}
                    <span
                        className={cn(
                            "ml-4 text-sm font-medium transition-opacity duration-200 hidden md:block",
                            isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        )}
                    >
                        Menu
                    </span>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto">

                    {/* 
             When collapsed: Show only Explore, Search, User ICONS.
             When expanded: Show ALL items with labels.
          */}

                    {((mobileOpen || isExpanded) ? expandedItems : navItems).map((item, index) => {
                        if ('type' in item && item.type === 'divider') {
                            return <div key={`divider-${index}`} className="my-2 h-px bg-white/10" />
                        }

                        // Setup for normal link item
                        const linkItem = item as { href: string; icon: any; label: string };
                        const isActive = pathname === linkItem.href;
                        return (
                            <Link
                                key={linkItem.href}
                                href={linkItem.href}
                                className={cn(
                                    "flex h-10 items-center rounded-md px-2 transition-colors hover:bg-white/10",
                                    // Center icon when collapsed, left align when expanded
                                    "justify-start"
                                )}
                                onClick={() => {
                                    if (mobileOpen && onMobileClose) onMobileClose()
                                }}
                            >
                                <div className={cn(
                                    "flex h-10 w-10 items-center justify-center", // Icon container fixed width
                                )}>
                                    <linkItem.icon size={24} className={cn(isActive && "text-blue-400")} />
                                </div>

                                <span
                                    className={cn(
                                        "ml-2 whitespace-nowrap text-sm font-medium transition-opacity duration-200",
                                        (mobileOpen || isExpanded) ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                                    )}
                                >
                                    {linkItem.label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

            </aside>
        </>
    )
}
