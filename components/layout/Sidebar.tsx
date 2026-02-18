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
        // Lock scroll only on mobile when menu is open
        if (mobileOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow
            document.body.style.overflow = "hidden"
            return () => {
                document.body.style.overflow = originalStyle
            }
        }
    }, [mobileOpen])

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
                    className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={onMobileClose}
                    aria-hidden="true"
                />
            )}

            {/* 
                Sidebar Container 
                Refactored for "Infinity Left" Hover:
                - Outer <aside>: Handles positioning and hover area. Touches md:left-0.
                - Inner <div>: Handles visual styling (glassmorphism, border, rounding). Has a gap via padding.
            */}
            <aside
                className={cn(
                    // Common Layout Styles
                    "fixed z-[70] flex flex-col transition-[width,transform] duration-300 ease-in-out will-change-[width,transform]",

                    // Mobile Positioning (Right attached)
                    "top-0 right-0 h-screen w-64",
                    mobileOpen ? "translate-x-0" : "translate-x-full",

                    // Desktop Positioning (Left floating-ish)
                    // The container touches the wall (left-0) to capture hover, 
                    // but we add padding (pl-1) to create the visual gap.
                    "md:translate-x-0",
                    "md:left-0 md:top-2 md:bottom-2 md:h-[calc(100vh-1rem)]",
                    "md:pl-1", // The 4px cursor-catch gap

                    // Width handling (Content + Gap)
                    isExpanded ? "md:w-[260px]" : "md:w-[68px]" // 256+4 and 64+4
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Visual Inner Wrapper */}
                <div className={cn(
                    "flex flex-col h-full w-full overflow-hidden", // Content clipper
                    "bg-black/20 backdrop-blur-xl border-white/10", // Glassmorphism

                    // Mobile Visuals
                    "border-l",

                    // Desktop Visuals
                    "md:border md:rounded-2xl"
                )}>
                    {/* Header / Menu Toggle */}
                    <div className={cn(
                        "flex h-16 items-center transition-[justify-content,padding] duration-200",
                        // Center when collapsed, Start when expanded
                        // Remove padding when collapsed to ensure perfect centering
                        isExpanded ? "px-4 justify-between md:justify-start" : "justify-center"
                    )}>
                        <button
                            onClick={togglePin}
                            className={cn(
                                "hidden md:flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10 transition-colors",
                                isPinned && "bg-white/10 text-primary", // Highlight if pinned
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
                                "text-sm font-medium transition-opacity duration-200 hidden md:block",
                                isExpanded ? "opacity-100 ml-4" : "opacity-0 w-0 overflow-hidden"
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
                                        "flex h-10 items-center rounded-md transition-colors hover:bg-white/10",
                                        // Center icon when collapsed, left align when expanded
                                        // Remove padding when collapsed to avoid offsetting center
                                        isExpanded ? "px-2 justify-start" : "justify-center"
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
                                            "whitespace-nowrap text-sm font-medium transition-opacity duration-200",
                                            (mobileOpen || isExpanded) ? "opacity-100 ml-2" : "opacity-0 w-0 overflow-hidden"
                                        )}
                                    >
                                        {linkItem.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </aside>
        </>
    )
}
