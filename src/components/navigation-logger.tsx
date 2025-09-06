'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { logUserAction } from '@/services/logs';

export const NavigationLogger = () => {
    const { data: session } = useSession();
    const pathname = usePathname();

    useEffect(() => {
        if (session?.user?.email && pathname) {
            // Log page access
            logUserAction(
                session.user.email,
                'NAVIGATION',
                'PAGE_ACCESS',
                {
                    message: `Accessed page: ${pathname}`,
                    newValue: { path: pathname, timestamp: Date.now() },
                    severity: 'INFO'
                },
                session.user.db
            );
        }
    }, [pathname, session]);

    return null; // This component doesn't render anything
};

export default NavigationLogger;
