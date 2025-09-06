'use client';

import { ReactNode } from 'react';
import { useLogs } from '@/hooks/useLogs';

interface LoggedFormProps {
    children: ReactNode;
    resource: string;
    onSubmit: (data: any) => Promise<void>;
    action?: 'CREATE' | 'UPDATE' | 'DELETE';
    className?: string;
    id?: string;
}

export const LoggedForm = ({
    children,
    resource,
    onSubmit,
    action = 'CREATE',
    className,
    id
}: LoggedFormProps) => {
    const { logAction, logError } = useLogs();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());

        try {
            // Log form submission attempt
            await logAction(resource, `${action}_ATTEMPT`, {
                message: `Attempting to ${action.toLowerCase()} ${resource}`,
                newValue: data,
                severity: 'INFO'
            });

            await onSubmit(data);

            // Log successful submission
            await logAction(resource, `${action}_SUCCESS`, {
                message: `Successfully ${action.toLowerCase()}d ${resource}`,
                newValue: data,
                severity: 'INFO'
            });

        } catch (error: any) {
            // Log form submission error
            await logError(resource, `Failed to ${action.toLowerCase()} ${resource}: ${error.message}`);
            throw error; // Re-throw to allow form to handle the error
        }
    };

    return (
        <form onSubmit={handleSubmit} className={className} id={id}>
            {children}
        </form>
    );
};
