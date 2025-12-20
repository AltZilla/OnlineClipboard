'use client';

import DeviceModal from '@/components/DeviceModal';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    return (
        <>
            <DeviceModal />
            {children}
        </>
    );
}
