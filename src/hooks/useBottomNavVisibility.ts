import { useCallback, useSyncExternalStore } from 'react';

// Global state for drawer visibility
class DrawerVisibilityStore {
    private isDrawerOpen = false;
    private listeners = new Set<() => void>();

    getState = () => {
        return this.isDrawerOpen;
    };

    setState = (isOpen: boolean) => {
        console.log('DrawerVisibilityStore setState:', isOpen);
        this.isDrawerOpen = isOpen;
        this.listeners.forEach(listener => listener());
    };

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };
}

const drawerStore = new DrawerVisibilityStore();

// Simple hook to manage drawer state for navigation hiding
export const useBottomNavVisibility = () => {
    const isAnyDrawerOpen = useSyncExternalStore(
        drawerStore.subscribe,
        drawerStore.getState,
        drawerStore.getState
    );

    const showDrawer = useCallback(() => {
        console.log('showDrawer called');
        drawerStore.setState(true);
    }, []);

    const hideDrawer = useCallback(() => {
        console.log('hideDrawer called');
        drawerStore.setState(false);
    }, []);

    return {
        shouldHideBottomNav: isAnyDrawerOpen,
        showDrawer,
        hideDrawer
    };
};
