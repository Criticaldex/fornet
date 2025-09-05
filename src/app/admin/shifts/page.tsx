'use client'
import { Suspense, useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import { ShiftIface } from "@/schemas/shift"
import { ShiftsForm } from "./form"
import { ShiftTable } from "./table"
import { Loading } from "@/components/loading.component"
import { getAllShifts } from "@/services/shifts"
import { getSession } from "next-auth/react"

export default function ShiftsPage() {
    const [rows, setRows] = useState<ShiftIface[]>([]);
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
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

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const sessionData = await getSession();
            setSession(sessionData);

            if (sessionData?.user?.db) {
                const shifts = await getAllShifts(sessionData.user.db);
                setRows(shifts || []);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load shifts data', { theme: "colored" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="flex flex-col xl:flex-row w-full h-full gap-4 p-4">
            {/* Left Panel - Table */}
            <div className="flex flex-col xl:w-2/3">
                <Suspense fallback={<Loading />}>
                    <ShiftTable
                        rows={rows}
                        setRows={setRows}
                        toast={toast}
                        session={session}
                        setEditingShift={setEditingShift}
                    />
                </Suspense>
            </div>

            {/* Right Panel - Form */}
            <div className="flex flex-col gap-4 xl:w-1/3">
                <Suspense fallback={<Loading />}>
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
                </Suspense>
            </div>

            <ToastContainer />
        </div>
    );
}
