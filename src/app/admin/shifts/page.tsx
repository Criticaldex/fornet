import { getSession } from "@/services/session"
import { ShiftTable } from "./table"
import { getAllShifts } from "@/services/shifts"

export default async function ShiftsPage() {
    const session = await getSession();
    let shifts = null;

    if (session?.user?.db) {
        shifts = await getAllShifts(session.user.db);
    }

    return (
        <div className="flex flex-col">
            <ShiftTable
                shifts={shifts || []}
                session={session}
            />
        </div>
    );
}
