import { logUserAction } from '@/services/logs';
import { headers } from 'next/headers';

interface ApiLogData {
    method: string;
    endpoint: string;
    userAgent?: string;
    ip?: string;
    body?: any;
    response?: any;
    duration?: number;
    status?: number;
}

export const logApiCall = async (
    endpoint: string,
    method: string,
    user: string,
    data: ApiLogData,
    db?: string
) => {
    try {
        await logUserAction(
            user,
            'API',
            `${method}_${endpoint}`,
            {
                message: `API call: ${method} ${endpoint}`,
                newValue: {
                    ...data,
                    timestamp: Date.now()
                },
                severity: data.status && data.status >= 400 ? 'ERROR' : 'INFO'
            },
            db
        );
    } catch (error) {
        console.error('Failed to log API call:', error);
    }
};

export const withApiLogging = (handler: Function) => {
    return async (request: Request, context?: any) => {
        const startTime = Date.now();
        const headersList = headers();
        const method = request.method;
        const url = new URL(request.url);
        const endpoint = url.pathname;

        let body;
        let user = 'SYSTEM';
        let db;

        try {
            // Try to get request body
            const bodyText = await request.text();
            if (bodyText) {
                body = JSON.parse(bodyText);
                // Recreate request with body for the handler
                request = new Request(request.url, {
                    method: request.method,
                    headers: request.headers,
                    body: bodyText
                });
            }
        } catch (error) {
            // Body parsing failed, continue without body
        }

        try {
            // Extract user info from headers or body if available
            const authHeader = headersList.get('authorization');
            if (body?.email) user = body.email;
            if (body?.user) user = body.user;
            if (context?.params?.db) db = context.params.db;

            const response = await handler(request, context);
            const duration = Date.now() - startTime;

            let responseData;
            let status = response.status;

            try {
                responseData = await response.clone().json();
            } catch (error) {
                responseData = 'Non-JSON response';
            }

            // Log the API call
            await logApiCall(endpoint, method, user, {
                method,
                endpoint,
                userAgent: headersList.get('user-agent') || undefined,
                ip: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined,
                body: body || undefined,
                response: responseData,
                duration,
                status
            }, db);

            return response;
        } catch (error: any) {
            const duration = Date.now() - startTime;

            // Log the failed API call
            await logApiCall(endpoint, method, user, {
                method,
                endpoint,
                userAgent: headersList.get('user-agent') || undefined,
                ip: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined,
                body: body || undefined,
                response: { error: error.message },
                duration,
                status: 500
            }, db);

            throw error;
        }
    };
};
