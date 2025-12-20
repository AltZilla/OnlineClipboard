'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface DeviceContextType {
    // Device info
    receiveCode: string | null;
    deviceName: string;
    isSetup: boolean;

    // Actions
    setupDevice: (code: string, name: string) => Promise<{ success: boolean; error?: string }>;
    updateDeviceName: (name: string) => Promise<boolean>;

    // Push notifications
    pushSupported: boolean;
    pushEnabled: boolean;
    requestPushPermission: () => Promise<boolean>;

    // Loading states
    loading: boolean;

    // Get shareable URL
    getReceiveUrl: () => string;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
    const [receiveCode, setReceiveCode] = useState<string | null>(null);
    const [deviceName, setDeviceName] = useState('');
    const [isSetup, setIsSetup] = useState(false);
    const [loading, setLoading] = useState(true);
    const [pushSupported, setPushSupported] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(false);

    // Initialize device from localStorage
    useEffect(() => {
        const storedReceiveCode = localStorage.getItem('receiveCode');
        const storedDeviceName = localStorage.getItem('deviceName');

        if (storedReceiveCode) {
            setReceiveCode(storedReceiveCode);
            setDeviceName(storedDeviceName || 'My Device');
            setIsSetup(true);
        }

        // Check push notification support
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setPushSupported(true);
            // Check if already subscribed
            navigator.serviceWorker.ready.then((registration) => {
                registration.pushManager.getSubscription().then((subscription) => {
                    setPushEnabled(!!subscription);
                });
            });
        }

        setLoading(false);
    }, []);

    // Register service worker
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered:', registration.scope);
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }, []);

    const setupDevice = async (code: string, name: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch('/api/devices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiveCode: code,
                    deviceName: name
                })
            });

            const data = await response.json();

            if (data.success) {
                setReceiveCode(data.device.receiveCode);
                setDeviceName(data.device.deviceName);
                setIsSetup(true);
                localStorage.setItem('receiveCode', data.device.receiveCode);
                localStorage.setItem('deviceName', data.device.deviceName);
                return { success: true };
            }

            return { success: false, error: data.error };
        } catch (error) {
            console.error('Error setting up device:', error);
            return { success: false, error: 'Failed to set up device' };
        }
    };

    const updateDeviceName = async (name: string): Promise<boolean> => {
        if (!receiveCode) return false;

        try {
            const response = await fetch('/api/devices', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiveCode, deviceName: name })
            });

            const data = await response.json();

            if (data.success) {
                setDeviceName(name);
                localStorage.setItem('deviceName', name);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating device name:', error);
            return false;
        }
    };

    const requestPushPermission = async (): Promise<boolean> => {
        if (!pushSupported || !receiveCode) return false;

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return false;

            const registration = await navigator.serviceWorker.ready;

            // Get VAPID public key
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidKey) {
                console.error('VAPID public key not configured');
                return false;
            }

            // Convert VAPID key to Uint8Array
            const urlBase64ToUint8Array = (base64String: string) => {
                const padding = '='.repeat((4 - base64String.length % 4) % 4);
                const base64 = (base64String + padding)
                    .replace(/-/g, '+')
                    .replace(/_/g, '/');
                const rawData = window.atob(base64);
                const outputArray = new Uint8Array(rawData.length);
                for (let i = 0; i < rawData.length; ++i) {
                    outputArray[i] = rawData.charCodeAt(i);
                }
                return outputArray;
            };

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey)
            });

            // Send subscription to server
            const response = await fetch('/api/devices', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiveCode,
                    pushSubscription: subscription.toJSON()
                })
            });

            const data = await response.json();

            if (data.success) {
                setPushEnabled(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error requesting push permission:', error);
            return false;
        }
    };

    const getReceiveUrl = useCallback(() => {
        if (typeof window === 'undefined') return '';
        return `${window.location.origin}/send/${receiveCode}`;
    }, [receiveCode]);

    return (
        <DeviceContext.Provider
            value={{
                receiveCode,
                deviceName,
                isSetup,
                setupDevice,
                updateDeviceName,
                pushSupported,
                pushEnabled,
                requestPushPermission,
                loading,
                getReceiveUrl
            }}
        >
            {children}
        </DeviceContext.Provider>
    );
}

export function useDevice() {
    const context = useContext(DeviceContext);
    if (context === undefined) {
        throw new Error('useDevice must be used within a DeviceProvider');
    }
    return context;
}
