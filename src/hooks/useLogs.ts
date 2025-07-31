import { useSession } from 'next-auth/react';
import { logUserAction, logCreate, logUpdate, logDelete, logError } from '@/services/logs';

export const useLogs = () => {
    const { data: session } = useSession();

    const logAction = async (
        resource: string,
        action: string,
        details?: {
            oldValue?: any;
            newValue?: any;
            message?: string;
            severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
        }
    ) => {
        if (!session?.user?.email) return;

        return await logUserAction(
            session.user.email,
            resource,
            action,
            details,
            session.user.db
        );
    };

    const logCreateAction = async (resource: string, newValue: any) => {
        if (!session?.user?.email) return;
        return await logCreate(session.user.email, resource, newValue, session.user.db);
    };

    const logUpdateAction = async (resource: string, oldValue: any, newValue: any) => {
        if (!session?.user?.email) return;
        return await logUpdate(session.user.email, resource, oldValue, newValue, session.user.db);
    };

    const logDeleteAction = async (resource: string, deletedValue: any) => {
        if (!session?.user?.email) return;
        return await logDelete(session.user.email, resource, deletedValue, session.user.db);
    };

    const logErrorAction = async (resource: string, error: string) => {
        if (!session?.user?.email) return;
        return await logError(session.user.email, resource, error, session.user.db);
    };

    return {
        logAction,
        logCreate: logCreateAction,
        logUpdate: logUpdateAction,
        logDelete: logDeleteAction,
        logError: logErrorAction,
    };
};
