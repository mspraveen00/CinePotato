'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AuthModal() {
    const { isAuthModalOpen, closeAuthModal, signInWithEmail, signUpWithEmail, signInWithOAuth } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    if (!isAuthModalOpen) return null;

    const resetState = () => {
        setEmail('');
        setPassword('');
        setUsername('');
        setError(null);
        setSuccessMessage(null);
        setLoading(false);
    };

    const handleClose = () => {
        resetState();
        closeAuthModal();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await signUpWithEmail(email, password, username);
                if (error) {
                    setError(error.message);
                } else {
                    setSuccessMessage('Account created! Check your email to confirm your account (or sign in if email confirmation is disabled).');
                }
            } else {
                const { error } = await signInWithEmail(email, password);
                if (error) {
                    setError(error.message);
                } else {
                    handleClose();
                }
            }
        } catch (err: any) {
            setError(err?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuth = async (provider: 'google') => {
        setError(null);
        setLoading(true);
        const { error } = await signInWithOAuth(provider);
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/90 p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
                >
                    {/* Decorative Ambient Glow */}
                    <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-5 right-5 rounded-full p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 shadow-inner">
                            <Sparkles size={24} />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">
                            {isSignUp ? 'Create your account' : 'Welcome to CinePotato'}
                        </h2>
                        <p className="mt-1 text-sm text-neutral-400">
                            {isSignUp
                                ? 'Save your ratings, bucketlists, and custom collections to the cloud.'
                                : 'Sign in to access your synchronized lists and ratings across devices.'}
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
                        >
                            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {/* Success Banner */}
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300"
                        >
                            <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-400" />
                            <span>{successMessage}</span>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                                    Username
                                </label>
                                <div className="relative">
                                    <UserIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="moviebuff"
                                        className="w-full rounded-xl border border-white/10 bg-neutral-900/80 px-10 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-white/10 bg-neutral-900/80 px-10 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-white/10 bg-neutral-900/80 px-10 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : isSignUp ? (
                                'Create Account'
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <span className="relative bg-neutral-950 px-3 text-xs uppercase tracking-wider text-neutral-500">
                            or continue with
                        </span>
                    </div>

                    {/* Google OAuth Button */}
                    <button
                        type="button"
                        onClick={() => handleOAuth('google')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 active:scale-[0.98] disabled:opacity-50"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path
                                fill="#EA4335"
                                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                            />
                            <path
                                fill="#4285F4"
                                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23.2c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.6C3.7 20.3 7.5 23.2 12 23.2z"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Switcher */}
                    <div className="mt-6 text-center text-xs text-neutral-400">
                        {isSignUp ? (
                            <>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetState();
                                        setIsSignUp(false);
                                    }}
                                    className="font-semibold text-amber-400 hover:underline"
                                >
                                    Sign in
                                </button>
                            </>
                        ) : (
                            <>
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetState();
                                        setIsSignUp(true);
                                    }}
                                    className="font-semibold text-amber-400 hover:underline"
                                >
                                    Create one
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
