'use client';

import { useState, useEffect } from 'react';
import { LogIface } from '@/schemas/log';
import { getTableValues } from '@/services/logs';
import { useSession } from 'next-auth/react';

interface LogsAnalyticsProps {
    logs: LogIface[];
}

export const LogsAnalytics = ({ logs }: LogsAnalyticsProps) => {
    const [analytics, setAnalytics] = useState({
        totalLogs: 0,
        byAction: {} as Record<string, number>,
        byUser: {} as Record<string, number>,
        byResource: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>,
        recentErrors: [] as LogIface[],
        topUsers: [] as Array<{ user: string; count: number }>,
        timeRange: {
            lastHour: 0,
            last24Hours: 0,
            lastWeek: 0
        }
    });

    useEffect(() => {
        if (!logs?.length) return;

        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const oneDay = 24 * oneHour;
        const oneWeek = 7 * oneDay;

        const byAction: Record<string, number> = {};
        const byUser: Record<string, number> = {};
        const byResource: Record<string, number> = {};
        const bySeverity: Record<string, number> = {};
        const recentErrors: LogIface[] = [];

        let lastHour = 0;
        let last24Hours = 0;
        let lastWeek = 0;

        logs.forEach(log => {
            // Count by action (extracted from resource)
            const action = log.resource.split(':')[1] || 'UNKNOWN';
            byAction[action] = (byAction[action] || 0) + 1;

            // Count by user
            byUser[log.user] = (byUser[log.user] || 0) + 1;

            // Count by resource type
            const resourceType = log.resource.split(':')[0];
            byResource[resourceType] = (byResource[resourceType] || 0) + 1;

            // Count by severity
            const severity = (log as any).severity || 'INFO';
            bySeverity[severity] = (bySeverity[severity] || 0) + 1;

            // Collect recent errors
            if (severity === 'ERROR' || severity === 'CRITICAL') {
                recentErrors.push(log);
            }

            // Time-based analytics
            const logAge = now - log.timestamp;
            if (logAge <= oneHour) lastHour++;
            if (logAge <= oneDay) last24Hours++;
            if (logAge <= oneWeek) lastWeek++;
        });

        // Sort recent errors by timestamp
        recentErrors.sort((a, b) => b.timestamp - a.timestamp);

        // Create top users array
        const topUsers = Object.entries(byUser)
            .map(([user, count]) => ({ user, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        setAnalytics({
            totalLogs: logs.length,
            byAction,
            byUser,
            byResource,
            bySeverity,
            recentErrors: recentErrors.slice(0, 10),
            topUsers,
            timeRange: {
                lastHour,
                last24Hours,
                lastWeek
            }
        });
    }, [logs]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {/* Total Logs */}
            <div className="bg-bgLight p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Total Logs</h3>
                <p className="text-3xl font-bold text-accent">{analytics.totalLogs}</p>
            </div>

            {/* Time Range Analytics */}
            <div className="bg-bgLight p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Activity</h3>
                <div className="space-y-1">
                    <p>Last Hour: <span className="font-semibold">{analytics.timeRange.lastHour}</span></p>
                    <p>Last 24h: <span className="font-semibold">{analytics.timeRange.last24Hours}</span></p>
                    <p>Last Week: <span className="font-semibold">{analytics.timeRange.lastWeek}</span></p>
                </div>
            </div>

            {/* Severity Breakdown */}
            <div className="bg-bgLight p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">By Severity</h3>
                <div className="space-y-1">
                    {Object.entries(analytics.bySeverity).map(([severity, count]) => (
                        <div key={severity} className="flex justify-between">
                            <span className={`px-2 py-1 rounded text-xs ${severity === 'ERROR' || severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                    severity === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                }`}>
                                {severity}
                            </span>
                            <span className="font-semibold">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Actions */}
            <div className="bg-bgLight p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Top Actions</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                    {Object.entries(analytics.byAction)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 8)
                        .map(([action, count]) => (
                            <div key={action} className="flex justify-between text-sm">
                                <span className="truncate">{action}</span>
                                <span className="font-semibold">{count}</span>
                            </div>
                        ))}
                </div>
            </div>

            {/* Top Resources */}
            <div className="bg-bgLight p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Top Resources</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                    {Object.entries(analytics.byResource)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 8)
                        .map(([resource, count]) => (
                            <div key={resource} className="flex justify-between text-sm">
                                <span className="truncate">{resource}</span>
                                <span className="font-semibold">{count}</span>
                            </div>
                        ))}
                </div>
            </div>

            {/* Top Users */}
            <div className="bg-bgLight p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Most Active Users</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                    {analytics.topUsers.map(({ user, count }) => (
                        <div key={user} className="flex justify-between text-sm">
                            <span className="truncate">{user}</span>
                            <span className="font-semibold">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Errors */}
            <div className="bg-bgLight p-4 rounded-md md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold mb-2">Recent Errors</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {analytics.recentErrors.length > 0 ? (
                        analytics.recentErrors.map((log, index) => (
                            <div key={index} className="border-l-4 border-red-500 pl-3 py-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-sm">{log.resource}</p>
                                        <p className="text-sm text-gray-600">{log.message}</p>
                                        <p className="text-xs text-gray-500">
                                            {log.user} • {new Date(log.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs ${(log as any).severity === 'CRITICAL' ? 'bg-red-200 text-red-900' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {(log as any).severity || 'ERROR'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">No recent errors</p>
                    )}
                </div>
            </div>
        </div>
    );
};
