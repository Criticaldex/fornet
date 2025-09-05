'use client'
import { useEffect, useMemo, useState, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import { createThemes } from "@/styles/themes";
import { ShiftIface } from "@/schemas/shift";
import { Loading } from "@/components/loading.component";
import { deleteValues, getAllShifts, formatShiftTime, getShiftDuration } from '@/services/shifts';
import { getSession } from "next-auth/react";
import { confirmAlert } from 'react-confirm-alert';
import { FaTrashCan, FaPenToSquare } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ShiftsForm } from "./form";

interface ShiftTableProps {
    shifts: ShiftIface[];
    session: any;
}

export function ShiftTable({ shifts: initialShifts, session }: ShiftTableProps) {
    const [rows, setRows] = useState<ShiftIface[]>(initialShifts);
    const [filterText, setFilterText] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editingShift, setEditingShift] = useState<ShiftIface | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        clearErrors,
        reset,
        resetField,
        watch,
        setValue
    } = useForm({
        defaultValues: {
            name: '',
            startTime: '',
            endTime: ''
        }
    });

    useEffect(() => {
        setIsClient(true);
    }, []);

    const refreshShifts = useCallback(async () => {
        if (!session?.user?.db) return;

        try {
            setIsLoading(true);
            const newShifts = await getAllShifts(session.user.db);
            setRows(newShifts || []);
        } catch (error) {
            console.error('Failed to refresh shifts:', error);
            toast.error('Failed to refresh shifts', { theme: "colored" });
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.db]);

    const filteredItems = useMemo(() => {
        return rows?.filter((item: ShiftIface) => {
            // Text search across name only
            const matchesText = !filterText ||
                item.name?.toLowerCase().includes(filterText.toLowerCase());

            return matchesText;
        }) || [];
    }, [rows, filterText]);

    const handleFilterChange = useCallback((value: string) => setFilterText(value), []);

    const handleDelete = useCallback(async (shift: ShiftIface) => {
        confirmAlert({
            message: '⚠️ Deleting shift "' + shift.name + '" ⚠️ Are you sure?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            await deleteValues(shift, session?.user?.db);
                            toast.success('Shift deleted successfully!', { theme: "colored" });
                            await refreshShifts();
                        } catch (error) {
                            console.error('Error deleting shift:', error);
                            toast.error('Failed to delete shift', { theme: "colored" });
                        }
                    }
                },
                {
                    label: 'No'
                }
            ]
        });
    }, [session?.user?.db, refreshShifts]);

    const handleEdit = useCallback((shift: ShiftIface) => {
        if (setEditingShift) {
            setEditingShift(shift);
            // Scroll to form
            document.getElementById('shiftsForm')?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [setEditingShift]);

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
                            placeholder="Search..."
                            aria-label="Search Input"
                            value={filterText}
                            onChange={(e) => handleFilterChange(e.target.value)}
                        />
                    </div>

                    {/* Refresh Button */}
                    <button
                        className={`bg-bgDark bg-opacity-20 dark:bg-opacity-80 hover:bg-opacity-40 my-1 mx-4 py-2 px-5 rounded-md text-textColor font-bold border border-accent ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={refreshShifts}
                        disabled={isLoading}
                    >
                        Refresh
                    </button>
                </div>

                {/* Results Count */}
                <div className="flex justify-between items-center">
                    <div className="text-sm text-textColor">
                        Showing {filteredItems.length} of {rows?.length || 0} shifts
                    </div>
                </div>
            </div>
        );
    }, [filterText, filteredItems.length, rows?.length, handleFilterChange, isLoading, refreshShifts]);

    const baseColumnStyle = {
        fontSize: 'var(--table-font)',
        backgroundColor: '',
        color: ''
    };

    const columns = [
        {
            name: 'Name',
            selector: (row: any) => row.name,
            sortable: true,
            style: baseColumnStyle,
            grow: 2,
            minWidth: '200px',
            cell: (row: any) => (
                <span className="font-medium">{row.name}</span>
            ),
        },
        {
            name: 'Time',
            selector: (row: any) => formatShiftTime(row),
            sortable: true,
            style: baseColumnStyle,
            grow: 1.5,
            minWidth: '180px',
            cell: (row: any) => (
                <div className="text-sm">
                    <div className="font-mono">{formatShiftTime(row)}</div>
                    <div className="text-gray-500 text-xs">
                        {getShiftDuration(row)} mins
                    </div>
                </div>
            ),
        },
        {
            name: 'Created',
            selector: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
            sortable: true,
            style: baseColumnStyle,
            grow: 1,
            minWidth: '120px',
        },
        {
            name: 'Actions',
            width: '120px',
            minWidth: '100px',
            cell: (row: any) => (
                <div className="flex gap-1 items-center">
                    <FaPenToSquare
                        onClick={() => handleEdit(row)}
                        className='cursor-pointer m-1'
                        title="Edit shift"
                    />
                    <FaTrashCan
                        onClick={() => handleDelete(row)}
                        className='cursor-pointer m-1'
                        title="Delete shift"
                    />
                </div>
            ),
        },
    ];

    createThemes();

    if (!isClient) {
        return <Loading />;
    }

    createThemes();

    return (
        <div className="flex flex-col xl:flex-row w-full h-full gap-4 p-4">
            {/* Left Panel - Table */}
            <div className="flex flex-col xl:w-2/3">
                <div className="flex-1 bg-bgLight rounded-md p-4">
                    <DataTable
                        title="Work Shifts"
                        columns={columns}
                        data={filteredItems}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[5, 10, 20, 50]}
                        subHeader
                        subHeaderComponent={subHeaderComponentMemo}
                        persistTableHead
                        theme="custom"
                        defaultSortFieldId={1}
                        defaultSortAsc={true}
                        dense
                        responsive
                        fixedHeader
                        fixedHeaderScrollHeight="calc(100vh - 300px)"
                        customStyles={{
                            table: {
                                style: {
                                    width: '100%',
                                    height: '100%',
                                    tableLayout: 'auto',
                                    minWidth: '100%'
                                }
                            },
                            tableWrapper: {
                                style: {
                                    width: '100%',
                                    overflow: 'auto'
                                }
                            },
                            headRow: {
                                style: {
                                    backgroundColor: 'var(--bg-light)',
                                    borderTopLeftRadius: '8px',
                                    borderTopRightRadius: '8px'
                                }
                            },
                            headCells: {
                                style: {
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    paddingLeft: '8px',
                                    paddingRight: '8px',
                                    color: 'var(--text-color)'
                                }
                            },
                            cells: {
                                style: {
                                    fontSize: '13px',
                                    paddingLeft: '8px',
                                    paddingRight: '8px',
                                    wordBreak: 'break-word',
                                    color: 'var(--text-color)'
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex flex-col gap-4 xl:w-1/3">
                <ShiftsForm
                    register={register}
                    handleSubmit={handleSubmit}
                    errors={errors}
                    clearErrors={clearErrors}
                    setRows={setRows}
                    toast={toast}
                    reset={reset}
                    resetField={resetField}
                    watch={watch}
                    setValue={setValue}
                    editingShift={editingShift}
                    setEditingShift={setEditingShift}
                />
            </div>

            <ToastContainer />
        </div>
    );
}
