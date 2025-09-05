'use client';

import { ShiftIface } from "@/schemas/shift";
import { insertValue, getAllShifts } from "@/services/shifts";
import { getSession } from "next-auth/react"
import { useEffect, useRef } from 'react';

interface ShiftsFormProps {
    register: any;
    handleSubmit: any;
    errors: any;
    clearErrors: any;
    setRows: any;
    toast: any;
    reset: any;
    resetField: any;
    watch: any;
    setValue: any;
    editingShift?: ShiftIface | null;
    setEditingShift?: (shift: ShiftIface | null) => void;
}

export const ShiftsForm = ({
    register,
    handleSubmit,
    errors,
    clearErrors,
    setRows,
    toast,
    reset,
    resetField,
    watch,
    setValue,
    editingShift,
    setEditingShift
}: ShiftsFormProps) => {
    const startTimeRef = useRef<HTMLInputElement>(null);
    const endTimeRef = useRef<HTMLInputElement>(null);

    // Load editing shift data
    useEffect(() => {
        if (editingShift) {
            setValue('name', editingShift.name);
            setValue('startTime', editingShift.startTime);
            setValue('endTime', editingShift.endTime);
        }
    }, [editingShift, setValue]);

    const onSubmit = handleSubmit(async (data: ShiftIface) => {
        const session = await getSession();

        try {
            // If editing, include the _id
            if (editingShift) {
                data._id = editingShift._id;
            }

            const upsert = await insertValue(data, session?.user.db);

            // Check if the API returned an error
            if (upsert.ERROR) {
                toast.error(`Error saving shift: ${upsert.ERROR}`, { theme: "colored" });
                return;
            }

            if (upsert.lastErrorObject?.updatedExisting || editingShift) {
                toast.success('Shift Modified!', { theme: "colored" });
            } else {
                toast.success('Shift Added!', { theme: "colored" });
            }

            // Reset form with default values
            reset({
                name: '',
                startTime: '',
                endTime: ''
            });

            // Clear editing state
            if (setEditingShift) {
                setEditingShift(null);
            }

            setRows(await getAllShifts(session?.user.db));
        } catch (error) {
            toast.error('Error saving shift!', { theme: "colored" });
            console.error('Error:', error);
        }
    });

    const validateTimeLogic = () => {
        const startTime = watch('startTime');
        const endTime = watch('endTime');

        if (!startTime || !endTime) return true;

        return startTime !== endTime; // Just ensure they're not the same
    };

    const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/[^\d:]/g, ''); // Only allow digits and colon

        // Remove extra colons
        const colonCount = (value.match(/:/g) || []).length;
        if (colonCount > 1) {
            value = value.replace(/:.*:/, ':');
        }

        // Format as HH:MM
        if (value.length === 2 && !value.includes(':')) {
            value = value + ':';
        } else if (value.length === 5) {
            const [hours, minutes] = value.split(':');
            const h = Math.min(parseInt(hours) || 0, 23).toString().padStart(2, '0');
            const m = Math.min(parseInt(minutes) || 0, 59).toString().padStart(2, '0');
            value = `${h}:${m}`;
        }

        e.target.value = value;
    };

    const validateTimeFormat = (value: string) => {
        if (!value) return "Time is required";

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value)) {
            return "Please enter time in HH:MM format (00:00 to 23:59)";
        }
        return true;
    };

    return (
        <form
            id="shiftsForm"
            className="flex flex-col gap-4 grow rounded-md p-4 bg-bgLight"
            onSubmit={onSubmit}
        >
            {/* Shift Name */}
            <div className="inline-flex justify-end">
                <label htmlFor="name" className="flex self-center">Name:</label>
                <input
                    id="name"
                    className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.name ? 'border-foreground' : 'border-red'}`}
                    placeholder="e.g., Morning Shift, Night Shift"
                    {...register("name", {
                        required: "Shift name is required",
                        maxLength: { value: 50, message: "Name cannot exceed 50 characters" }
                    })}
                />
            </div>
            {errors.name && <p role="alert" className="text-red self-end">⚠ {errors.name?.message}</p>}

            {/* Start Time */}
            <div className="inline-flex justify-end">
                <label htmlFor="startTime" className="flex self-center">Start Time:</label>
                <input
                    id="startTime"
                    ref={startTimeRef}
                    type="text"
                    placeholder="HH:MM (e.g., 08:00)"
                    maxLength={5}
                    onInput={handleTimeInput}
                    className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.startTime ? 'border-foreground' : 'border-red'}`}
                    {...register("startTime", {
                        required: "Start time is required",
                        validate: {
                            format: validateTimeFormat,
                            timeLogic: () => validateTimeLogic() || "Start time cannot be the same as end time"
                        }
                    })}
                />
            </div>
            {errors.startTime && <p role="alert" className="text-red self-end">⚠ {errors.startTime?.message}</p>}

            {/* End Time */}
            <div className="inline-flex justify-end">
                <label htmlFor="endTime" className="flex self-center">End Time:</label>
                <input
                    id="endTime"
                    ref={endTimeRef}
                    type="text"
                    placeholder="HH:MM (e.g., 17:00)"
                    maxLength={5}
                    onInput={handleTimeInput}
                    className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.endTime ? 'border-foreground' : 'border-red'}`}
                    {...register("endTime", {
                        required: "End time is required",
                        validate: {
                            format: validateTimeFormat,
                            timeLogic: () => validateTimeLogic() || "End time cannot be the same as start time"
                        }
                    })}
                />
            </div>
            {errors.endTime && <p role="alert" className="text-red self-end">⚠ {errors.endTime?.message}</p>}

            {/* Submit, Clear and Cancel Buttons */}
            <div className="flex justify-around gap-2 mt-4">
                {/* Clear Button */}
                <button
                    type="button"
                    onClick={() => {
                        if (setEditingShift) {
                            setEditingShift(null);
                        }
                        reset({
                            name: '',
                            startTime: '',
                            endTime: ''
                        });
                    }}
                    className="my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-bgDark hover:bg-opacity-80"
                >
                    Clear
                </button>

                <button
                    type="submit"
                    className="my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-accent hover:bg-accent-hover"
                >
                    {editingShift ? 'Update Shift' : 'Save Shift'}
                </button>
            </div>
        </form>
    );
};
