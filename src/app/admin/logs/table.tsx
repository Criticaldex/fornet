'use client'
import { useEffect, useMemo, useState, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import { createThemes } from "@/styles/themes";
import { LogIface } from "@/schemas/log";
import { Loading } from "@/components/loading.component";
import { deleteValues, getTableValues } from '@/services/logs';

interface LogTableProps {
   logs: LogIface[];
   session: any;
}

export function LogTable({ logs, session }: LogTableProps) {
   const [rows, setRows] = useState<LogIface[]>(logs || []);
   const [filterText, setFilterText] = useState('');
   const [isClient, setIsClient] = useState(false);
   const [dateRange, setDateRange] = useState({ start: '', end: '' });
   const [severityFilter, setSeverityFilter] = useState('ALL');
   const [isAutoRefresh, setIsAutoRefresh] = useState(false);
   const [refreshInterval, setRefreshInterval] = useState(30); // seconds
   const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
   const [isLoading, setIsLoading] = useState(false);
   const [selectedLog, setSelectedLog] = useState<LogIface | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);

   useEffect(() => {
      setIsClient(true);
      setRows(logs || []);
      setLastUpdate(new Date());
   }, [logs]);

   // Auto-refresh functionality
   const refreshLogs = useCallback(async () => {
      if (!session?.user?.db) return;

      try {
         setIsLoading(true);
         const newLogs = await getTableValues({} as any, undefined, session.user.db);
         setRows(newLogs || []);
         setLastUpdate(new Date());
      } catch (error) {
         console.error('Failed to refresh logs:', error);
      } finally {
         setIsLoading(false);
      }
   }, [session?.user?.db]);

   // Set up auto-refresh interval
   useEffect(() => {
      if (!isAutoRefresh) return;

      const interval = setInterval(() => {
         refreshLogs();
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
   }, [isAutoRefresh, refreshInterval, refreshLogs]);

   // Helper function for date filtering
   const isWithinDateRange = useCallback((timestamp: number, startDate: string, endDate: string) => {
      if (!startDate && !endDate) return true;

      const logDate = new Date(timestamp);

      if (startDate) {
         const start = new Date(startDate);
         if (logDate < start) return false;
      }

      if (endDate) {
         const end = new Date(endDate);
         // If it's a date without time, include the whole day
         if (endDate.includes('T')) {
            // Has time component, use exact time
            if (logDate > end) return false;
         } else {
            // No time component, include until end of day
            end.setHours(23, 59, 59, 999);
            if (logDate > end) return false;
         }
      }

      return true;
   }, []);

   const filteredItems = useMemo(() => {
      return rows?.filter((item: LogIface) => {
         // Text search across user, resource, and message
         const matchesText = !filterText ||
            item.user?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.resource?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.message?.toLowerCase().includes(filterText.toLowerCase());

         // Date range filter
         const matchesDateRange = isWithinDateRange(item.timestamp, dateRange.start, dateRange.end);

         // Severity filter
         const matchesSeverity = severityFilter === 'ALL' ||
            (item as any).severity === severityFilter;

         return matchesText && matchesDateRange && matchesSeverity;
      }) || [];
   }, [rows, filterText, dateRange, severityFilter, isWithinDateRange]);

   const handleFilterChange = useCallback((value: string) => setFilterText(value), []);

   const handleDateRangeChange = useCallback((field: 'start' | 'end', value: string) => {
      setDateRange(prev => ({ ...prev, [field]: value }));
   }, []);

   const handleSeverityChange = useCallback((value: string) => setSeverityFilter(value), []);

   const clearFilters = useCallback(() => {
      setFilterText('');
      setDateRange({ start: '', end: '' });
      setSeverityFilter('ALL');
   }, []);

   const subHeaderComponentMemo = useMemo(() => {
      return (
         <div className="flex flex-col gap-2 p-2 w-full">
            <div className="flex flex-wrap gap-2 items-center justify-between">
               {/* Text Search */}
               <div className="flex items-center gap-2">
                  <input
                     id="search"
                     type="text"
                     className="text-textColor border-b-2 bg-bgDark rounded-md p-2 min-w-64"
                     placeholder="Search user, resource, or message"
                     aria-label="Search Input"
                     value={filterText}
                     onChange={(e) => handleFilterChange(e.target.value)}
                  />
               </div>

               {/* Date Range Filters */}
               <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">From:</label>
                  <input
                     type="datetime-local"
                     className="text-textColor border-b-2 bg-bgDark rounded-md p-1"
                     value={dateRange.start}
                     onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  />
                  <label className="text-sm font-medium">To:</label>
                  <input
                     type="datetime-local"
                     className="text-textColor border-b-2 bg-bgDark rounded-md p-1"
                     value={dateRange.end}
                     onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  />
               </div>

               {/* Severity Filter */}
               <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Severity:</label>
                  <select
                     className="text-textColor border-b-2 bg-bgDark rounded-md p-1"
                     value={severityFilter}
                     onChange={(e) => handleSeverityChange(e.target.value)}
                  >
                     <option value="ALL">All</option>
                     <option value="INFO">Info</option>
                     <option value="WARNING">Warning</option>
                     <option value="ERROR">Error</option>
                     <option value="CRITICAL">Critical</option>
                  </select>
               </div>

               {/* Clear Filters Button */}
               <button
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                  onClick={clearFilters}
               >
                  Clear Filters
               </button>

               {/* Manual Refresh Button */}
               <button
                  className={`bg-bgDark bg-opacity-20 dark:bg-opacity-80 hover:bg-opacity-40 my-1 mx-4 py-2 px-5 rounded-md text-textColor font-bold border border-accent ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={refreshLogs}
                  disabled={isLoading}
               >
                  Refresh
               </button>

               {/* Auto-refresh Controls */}
               <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-sm">
                     <input
                        type="checkbox"
                        checked={isAutoRefresh}
                        onChange={(e) => setIsAutoRefresh(e.target.checked)}
                        className="rounded"
                     />
                     Auto-refresh
                  </label>
                  <select
                     className="text-textColor border-b-2 bg-bgDark rounded-md p-1 text-sm"
                     value={refreshInterval}
                     onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                     disabled={!isAutoRefresh}
                  >
                     <option value={10}>10s</option>
                     <option value={30}>30s</option>
                     <option value={60}>1m</option>
                     <option value={300}>5m</option>
                  </select>
               </div>
            </div>

            {/* Status and Results Count */}
            <div className="flex justify-between items-center">
               <div className="text-sm text-gray-600">
                  Showing {filteredItems.length} of {rows?.length || 0} logs
                  {(dateRange.start || dateRange.end) && (
                     <span className="ml-2 text-blue-600">
                        (Date filtered: {dateRange.start && `from ${new Date(dateRange.start).toLocaleDateString()}`}
                        {dateRange.start && dateRange.end && ' '}
                        {dateRange.end && `to ${new Date(dateRange.end).toLocaleDateString()}`})
                     </span>
                  )}
               </div>

               {/* Last Update Info */}
               <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
                  {isAutoRefresh && (
                     <span className="text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Auto-refresh ON
                     </span>
                  )}
               </div>
            </div>
         </div>
      );
   }, [filterText, dateRange, severityFilter, filteredItems.length, rows?.length, clearFilters, handleFilterChange, handleDateRangeChange, handleSeverityChange, isAutoRefresh, isLoading, lastUpdate, refreshInterval, refreshLogs]);

   const getSeverityBadge = (severity: string) => {
      const severityColors = {
         'INFO': 'bg-blue-100 text-blue-800',
         'WARNING': 'bg-yellow-100 text-yellow-800',
         'ERROR': 'bg-red-100 text-red-800',
         'CRITICAL': 'bg-red-200 text-red-900'
      };

      return (
         <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[severity as keyof typeof severityColors] || severityColors.INFO}`}>
            {severity}
         </span>
      );
   };

   const baseColumnStyle = {
      fontSize: 'var(--table-font)',
      backgroundColor: '',
      color: ''
   };

   const columns = [
      {
         name: 'User',
         selector: (row: any) => row.user,
         sortable: true,
         style: baseColumnStyle,
         width: '140px',
      },
      {
         name: 'Resource',
         selector: (row: any) => row.resource,
         sortable: true,
         style: baseColumnStyle,
         width: '180px',
         wrap: true,
      },
      {
         name: 'Timestamp',
         selector: (row: any) => new Date(row.timestamp).toLocaleString(),
         sortable: true,
         style: baseColumnStyle,
         width: '200px',
      },
      {
         name: 'Severity',
         selector: (row: any) => row.severity || 'INFO',
         sortable: true,
         style: baseColumnStyle,
         width: '100px',
         cell: (row: any) => getSeverityBadge(row.severity || 'INFO')
      },
      {
         name: 'Old Value',
         selector: (row: any) => row.oldValue || '-',
         sortable: false,
         style: baseColumnStyle,
         width: '150px',
         wrap: true,
         cell: (row: any) => {
            const value = row.oldValue;
            if (!value || value === '-') return '-';

            // Truncate long values and show in title
            const truncated = value.length > 50 ? value.substring(0, 50) + '...' : value;
            return (
               <span title={value} className="text-xs">
                  {truncated}
               </span>
            );
         }
      },
      {
         name: 'New Value',
         selector: (row: any) => row.newValue || '-',
         sortable: false,
         style: baseColumnStyle,
         width: '150px',
         wrap: true,
         cell: (row: any) => {
            const value = row.newValue;
            if (!value || value === '-') return '-';

            // Truncate long values and show in title
            const truncated = value.length > 50 ? value.substring(0, 50) + '...' : value;
            return (
               <span title={value} className="text-xs">
                  {truncated}
               </span>
            );
         }
      },
      {
         name: 'Message',
         selector: (row: any) => row.message || '-',
         sortable: false,
         style: baseColumnStyle,
         wrap: true,
         grow: 1,
         cell: (row: any) => {
            const message = row.message || '-';
            return (
               <div className="py-1">
                  <span className="text-sm">{message}</span>
               </div>
            );
         }
      },
      {
         name: 'Actions',
         width: '80px',
         cell: (row: any) => (
            <button
               className="bg-bgDark bg-opacity-20 dark:bg-opacity-80 hover:bg-opacity-40"
               onClick={() => {
                  setSelectedLog(row);
                  setIsModalOpen(true);
               }}
               title="View full log details"
            >
               ℹ️
            </button>
         ),
      },
   ];

   createThemes();

   if (!isClient) {
      return <Loading />;
   }

   return (
      <div className="flex flex-col rounded-md w-full">
         <div className="flex flex-col grow min-h-0">
            <DataTable
               title="System Logs"
               columns={columns}
               data={filteredItems}
               pagination
               paginationPerPage={20}
               paginationRowsPerPageOptions={[10, 20, 50, 100]}
               subHeader
               subHeaderComponent={subHeaderComponentMemo}
               persistTableHead
               theme="custom"
               defaultSortFieldId={3}
               defaultSortAsc={false}
               dense
               responsive
               customStyles={{
                  table: {
                     style: {
                        width: '100%',
                        tableLayout: 'fixed'
                     }
                  },
                  headCells: {
                     style: {
                        fontSize: '14px',
                        fontWeight: 'bold',
                        paddingLeft: '8px',
                        paddingRight: '8px',
                     }
                  },
                  cells: {
                     style: {
                        fontSize: '13px',
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        wordBreak: 'break-word'
                     }
                  }
               }}
            />
         </div>

         {/* Log Details Modal */}
         {isModalOpen && selectedLog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
               <div className="bg-bgLight rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                     <h3 className="text-lg font-semibold text-textColor">Log Details</h3>
                     <button
                        className="text-gray-500 hover:text-gray-700 text-xl"
                        onClick={() => setIsModalOpen(false)}
                     >
                        ×
                     </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-4 overflow-y-auto flex-1">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Basic Info */}
                        <div className="space-y-3">
                           <div>
                              <label className="block text-sm font-medium text-gray-600">User</label>
                              <p className="text-textColor font-mono bg-bgDark p-2 rounded">{selectedLog.user}</p>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-600">Resource</label>
                              <p className="text-textColor font-mono bg-bgDark p-2 rounded">{selectedLog.resource}</p>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-600">Timestamp</label>
                              <p className="text-textColor font-mono bg-bgDark p-2 rounded">
                                 {new Date(selectedLog.timestamp).toLocaleString()}
                              </p>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-600">Severity</label>
                              <div className="pt-1">
                                 {getSeverityBadge((selectedLog as any).severity || 'INFO')}
                              </div>
                           </div>
                        </div>

                        {/* Message */}
                        <div>
                           <label className="block text-sm font-medium text-gray-600">Message</label>
                           <p className="text-textColor bg-bgDark p-2 rounded whitespace-pre-wrap">
                              {selectedLog.message || 'No message'}
                           </p>
                        </div>
                     </div>

                     {/* Values Section */}
                     <div className="mt-6 space-y-4">
                        {/* Old Value */}
                        {selectedLog.oldValue && (
                           <div>
                              <label className="block text-sm font-medium text-gray-600 mb-2">Old Value</label>
                              <pre className="text-textColor bg-bgDark p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap border">
                                 {(() => {
                                    try {
                                       return JSON.stringify(JSON.parse(selectedLog.oldValue!), null, 2);
                                    } catch {
                                       return selectedLog.oldValue;
                                    }
                                 })()}
                              </pre>
                           </div>
                        )}

                        {/* New Value */}
                        {selectedLog.newValue && (
                           <div>
                              <label className="block text-sm font-medium text-gray-600 mb-2">New Value</label>
                              <pre className="text-textColor bg-bgDark p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap border">
                                 {(() => {
                                    try {
                                       return JSON.stringify(JSON.parse(selectedLog.newValue!), null, 2);
                                    } catch {
                                       return selectedLog.newValue;
                                    }
                                 })()}
                              </pre>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end p-4 border-t border-gray-200">
                     <button
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                        onClick={() => setIsModalOpen(false)}
                     >
                        Close
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

