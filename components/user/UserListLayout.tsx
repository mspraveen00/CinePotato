import React from 'react';
import { ArrowLeft, Filter, Grid, List as ListIcon } from 'lucide-react';
import Link from 'next/link';

interface UserListLayoutProps {
    title: string;
    children: React.ReactNode;
    actionButton?: React.ReactNode;
}

export function UserListLayout({ title, children, actionButton }: UserListLayoutProps) {
    return (
        <div className="flex flex-col h-full bg-black text-white p-4 md:p-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/user" className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold">{title}</h1>
                </div>
                {actionButton}
            </div>



            {/* Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {children}
            </div>
        </div>
    );
}
