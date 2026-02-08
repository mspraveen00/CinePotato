'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function useBackNavigation() {
    const router = useRouter()
    const pathname = usePathname()
    const lastListRef = useRef<string>('/')

    useEffect(() => {
        // If we are on a "list" page (Home, Search), update the ref
        if (pathname === '/' || pathname.startsWith('/search')) {
            lastListRef.current = pathname
        }
    }, [pathname])

    const goBack = () => {
        // Logic: If we are on a detail page, and the previous page was also a detail page (in history),
        // we likely want to go back to the list rather than the previous detail page.
        // However, simply pushing 'lastListRef' is safer for "Up" navigation.

        // For Phase 1, we will default to: Go to the last known list page or Home.
        // This strictly fulfills "Back should return to Home or Search, not step through every title"
        router.push(lastListRef.current)
    }

    return { goBack }
}
