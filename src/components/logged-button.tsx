'use client';

import { useLogs } from '@/hooks/useLogs';
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface LoggedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    action: string;
    resource: string;
    severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    logData?: any;
}

export const LoggedButton = ({
    children,
    action,
    resource,
    severity = 'INFO',
    logData,
    onClick,
    ...buttonProps
}: LoggedButtonProps) => {
    const { logAction } = useLogs();

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        // Log the button click
        await logAction(resource, action, {
            message: `Button clicked: ${action} on ${resource}`,
            newValue: logData,
            severity
        });

        // Call original onClick if provided
        if (onClick) {
            onClick(e);
        }
    };

    return (
        <button {...buttonProps} onClick={handleClick}>
            {children}
        </button>
    );
};

// Hook for manual interaction logging
export const useInteractionLogger = () => {
    const { logAction } = useLogs();

    const logInteraction = async (
        element: string,
        action: string,
        details?: any
    ) => {
        await logAction('UI_INTERACTION', action, {
            message: `User interacted with ${element}: ${action}`,
            newValue: { element, details },
            severity: 'INFO'
        });
    };

    const logClick = (element: string, details?: any) =>
        logInteraction(element, 'CLICK', details);

    const logView = (page: string, details?: any) =>
        logInteraction(page, 'VIEW', details);

    const logSearch = (query: string, results?: number) =>
        logInteraction('SEARCH', 'QUERY', { query, results });

    const logFilter = (filterType: string, value: any) =>
        logInteraction('FILTER', 'APPLY', { filterType, value });

    return {
        logInteraction,
        logClick,
        logView,
        logSearch,
        logFilter
    };
};
