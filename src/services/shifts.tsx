import { getSession } from "@/services/session"
import { ShiftIface } from "@/schemas/shift";

const getValues = async (filter: ShiftIface, fields?: string[], db?: string) => {
    try {
        if (!db) {
            const session = await getSession();
            db = session?.user.db;
        }

        if (!fields) {
            fields = ['-_id'];
        }

        // Use relative URL for internal API calls
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts/${db}`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                token: `${process.env.NEXT_PUBLIC_API_KEY}`,
            },
            body: JSON.stringify({
                fields: fields,
                filter: filter,
                sort: { createdAt: 1 } // Sort by creation date ascending
            }),
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return [];
    }
}

const insertValue = async (body: ShiftIface, db?: string) => {
    if (!db) {
        const session = await getSession();
        db = session?.user.db;
    }

    if (!body) {
        throw new Error('Body is required');
    }

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts/${db}`,
        {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json',
                token: `${process.env.NEXT_PUBLIC_API_KEY}`,
            },
            body: JSON.stringify(body),
        }).then(res => res.json());
}

export { insertValue };

export const deleteValues = async (filter: ShiftIface, db: string | undefined) => {
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts/${db}`,
        {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json',
                token: `${process.env.NEXT_PUBLIC_API_KEY}`,
            },
            body: JSON.stringify(filter)
        }).then(res => res.json());
}

// Utility functions for shift management
export const getAllShifts = async (db?: string) => {
    return getValues({} as ShiftIface, undefined, db);
}

export const formatShiftTime = (shift: ShiftIface): string => {
    return `${shift.startTime} - ${shift.endTime}`;
}

export const getShiftDuration = (shift: ShiftIface): number => {
    const [startHour, startMin] = shift.startTime.split(':').map(Number);
    const [endHour, endMin] = shift.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes <= endMinutes) {
        // Same day shift
        return endMinutes - startMinutes;
    } else {
        // Overnight shift
        return (24 * 60) - startMinutes + endMinutes;
    }
}
