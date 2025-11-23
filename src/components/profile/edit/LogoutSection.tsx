'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, AlertTriangle } from 'lucide-react';
import { Button } from '@/lib/ui/components/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';

export function LogoutSection() {
    const { logout } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogoutClick = () => {
        setShowConfirmation(true);
    };

    const handleConfirmLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();

            // Show success toast
            showToast('Logged out successfully!', 'success', 2000);

            // Wait a moment for the toast to be visible, then redirect
            setTimeout(() => {
                router.push('/');
            }, 500);
        } catch (error) {
            console.error('Logout failed:', error);
            // Show error toast but still redirect
            showToast('Logout failed. Redirecting...', 'error', 2000);
            setTimeout(() => {
                router.push('/onboarding');
            }, 500);
        } finally {
            setIsLoggingOut(false);
            setShowConfirmation(false);
        }
    };

    const handleCancelLogout = () => {
        setShowConfirmation(false);
    };

    return (
        <div className="px-4 py-6 border-t border-white/10">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Account</h3>

                {!showConfirmation ? (
                    <Button
                        variant="secondary"
                        onClick={handleLogoutClick}
                        className="w-full flex items-center justify-center space-x-2 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                        disabled={isLoggingOut}
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </Button>
                ) : (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="text-red-400 font-medium mb-2">Confirm Logout</h4>
                                <p className="text-red-300 text-sm mb-4">
                                    Are you sure you want to logout?
                                </p>
                                <div className="flex space-x-3">
                                    <Button
                                        variant="secondary"
                                        onClick={handleConfirmLogout}
                                        isLoading={isLoggingOut}
                                        disabled={isLoggingOut}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white border-red-500"
                                    >
                                        {isLoggingOut ? 'Logging out...' : 'Yes, Logout'}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={handleCancelLogout}
                                        disabled={isLoggingOut}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
