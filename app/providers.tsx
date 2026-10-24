'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { UserListsProvider } from '@/lib/store/user-lists-store'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/auth/AuthModal'

export default function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <UserListsProvider>
                    {children}
                    <AuthModal />
                </UserListsProvider>
            </AuthProvider>
        </QueryClientProvider>
    )
}
