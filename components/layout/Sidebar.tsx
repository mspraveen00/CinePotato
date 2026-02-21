"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Search, User, Menu, Settings, Info, CircleUser } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
    mobileOpen?: boolean
    onMobileClose?: () => void
    isTitlePage?: boolean
}

export function Sidebar({ mobileOpen = false, onMobileClose, isTitlePage = false }: SidebarProps) {
    const pathname = usePathname()
    const [isHovered, setIsHovered] = React.useState(false)
    const [isPinned, setIsPinned] = React.useState(false)
    const [isTeasing, setIsTeasing] = React.useState(false) // For the initial 1-second tease

    // Combined expanded state
    const isExpanded = isHovered || isPinned

    // Visibility state
    const isVisible = isExpanded || isTeasing || !isTitlePage

    // Tease effect on title pages
    React.useEffect(() => {
        if (isTitlePage) {
            setIsTeasing(true)
            const timer = setTimeout(() => {
                setIsTeasing(false)
            }, 1200) // Show for 1.2 seconds before hiding
            return () => clearTimeout(timer)
        } else {
            setIsTeasing(false)
        }
    }, [pathname, isTitlePage])

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
                    "fixed z-[70] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-[width,transform]",

                    // If it's a title page, completely hide this entire component DOM on mobile.
                    isTitlePage ? "hidden md:flex" : "flex",

                    // Mobile Positioning (Right attached - only applies if !isTitlePage)
                    "top-0 right-0 h-screen w-64",
                    mobileOpen ? "translate-x-0" : "translate-x-full",

                    // Desktop Positioning (Left floating-ish)
                    // The container touches the wall (left-0) to capture hover, 
                    // but we add padding (pl-1) to create the visual gap.
                    // If it's a Title page and NOT visible, we push it completely off screen.
                    isTitlePage && !isVisible
                        ? "-translate-x-full md:-translate-x-[calc(100%-2px)]"
                        : "md:translate-x-0",
                    "md:left-0 md:top-2 md:bottom-2 md:h-[calc(100vh-1rem)]",
                    // When on a title page and hidden, we don't need the visual gap padding until it reveals
                    isTitlePage && !isVisible ? "" : "md:pl-1", // The 4px cursor-catch gap

                    // Width handling (Content + Gap)
                    isExpanded ? "md:w-[260px]" : "md:w-[68px]" // 256+4 and 64+4
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Visual Inner Wrapper */}
                <div className={cn(
                    "flex flex-col h-full w-full overflow-hidden", // Content clipper

                    // Premium Glassmorphism
                    "bg-[rgba(15,15,15,0.6)] backdrop-blur-[20px]", // Dark semi-transparent glass
                    "bg-gradient-to-b from-transparent via-white/[0.02] to-transparent", // Subtle inner gradient

                    // Borders & depth
                    "border-l md:border border-[rgba(255,255,255,0.08)]",
                    "shadow-[0_0_40px_rgba(0,0,0,0.7),inset_1px_0_1px_rgba(255,255,255,0.05),inset_1px_0_20px_rgba(0,100,255,0.05)]",

                    // Desktop Visuals
                    "md:rounded-2xl"
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
                                "hidden md:flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                                isPinned
                                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" // Pinned glow
                                    : "text-white/70 hover:text-white hover:bg-white/5 hover:scale-110" // Default hover
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
                                        "flex h-10 items-center rounded-xl transition-all duration-300 group",
                                        // Center icon when collapsed, left align when expanded
                                        // Remove padding when collapsed to avoid offsetting center
                                        isExpanded ? "px-2 justify-start" : "justify-center",

                                        // Premium Interaction States
                                        isActive
                                            ? "bg-white/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] opacity-100 text-white"
                                            : "opacity-70 hover:opacity-100 hover:bg-white/5 hover:scale-105 text-white/80"
                                    )}
                                    onClick={() => {
                                        if (mobileOpen && onMobileClose) onMobileClose()
                                    }}
                                >
                                    <div className={cn(
                                        "flex h-10 w-10 items-center justify-center", // Icon container fixed width
                                    )}>
                                        <linkItem.icon size={24} className={cn(
                                            "transition-colors duration-300",
                                            isActive && "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" // Accent glow
                                        )} />
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
