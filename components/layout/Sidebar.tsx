"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Search, User, Menu, Settings, Info, CircleUser } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
    const pathname = usePathname()
    const [isHovered, setIsHovered] = React.useState(false)
    const [isPinned, setIsPinned] = React.useState(false)

    // Combined expanded state
    const isExpanded = isHovered || isPinned

    // Toggle pin state
    const togglePin = () => setIsPinned(!isPinned)

    // Primary navigation items
    const navItems = [
        { href: "/explore", icon: Compass, label: "Explore" },
        { href: "/search", icon: Search, label: "Search" },
        { href: "/user", icon: User, label: "User" },
    ]

    // Secondary items (only visible when expanded)
    const secondaryItems = [
        { href: "/explore", icon: Compass, label: "Explore" }, // Re-listed in secondary menu as per req?
        // "Menu contains: Explore, Search, User, Settings, Account, About"
        // Technically duplicate links but in the menu section.
        // Let's interpret "Menu contains" as the *list* shown when expanded.
        // But basic sidebar has Explore/Search/User icons always visible.
        // When expanded, we show these + others.

        // Actually, distinct lists might be better.
        // Top section: Primary (Always visible icons)
        // Bottom/Menu section? 
        // The prompt says: "Menu (hamburger) icon... contains Explore, Search, User, Settings, Account, About"
        // And "Sidebar... Shows icons of only Primary Sections (no labels) [Collapsed]"
        // "Expanded... Shows icons + text labels... Includes additional items"
    ]

    // Let's unify the list for the expanded view.
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
            {/* 
        Sidebar Container 
        - Fixed height, fixed left.
        - Width transitions.
        - Glassmorphism.
        - z-index high to overlay content.
      */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/10 bg-black/20 backdrop-blur-xl transition-[width] duration-300 ease-in-out will-change-[width]",
                    isExpanded ? "w-64" : "w-[72px]" // Collapsed width 72px roughly matches icon size + padding
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Header / Menu Toggle */}
                <div className="flex h-16 items-center px-4">
                    <button
                        onClick={togglePin}
                        className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10 transition-colors",
                            isPinned && "bg-white/10 text-primary" // Highlight if pinned
                        )}
                        aria-label="Toggle Menu"
                    >
                        <Menu size={24} />
                    </button>
                    {/* Label only visible when expanded */}
                    <span
                        className={cn(
                            "ml-4 text-sm font-medium transition-opacity duration-200",
                            isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        )}
                    >
                        Menu
                    </span>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 flex flex-col gap-2 p-2">

                    {/* 
             When collapsed: Show only Explore, Search, User ICONS.
             When expanded: Show ALL items with labels.
             
             Actually, the prompt says "Collapsed... Shows icons of only Primary Sections".
             "Expanded... Includes additional items: Settings, Account, About"
          */}

                    {(isExpanded ? expandedItems : navItems).map((item, index) => {
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
                            >
                                <div className={cn(
                                    "flex h-10 w-10 items-center justify-center", // Icon container fixed width
                                )}>
                                    <linkItem.icon size={24} className={cn(isActive && "text-blue-400")} />
                                </div>

                                <span
                                    className={cn(
                                        "ml-2 whitespace-nowrap text-sm font-medium transition-opacity duration-200",
                                        isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
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
