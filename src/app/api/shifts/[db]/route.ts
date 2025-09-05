import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import ShiftSchema, { ShiftIface } from '@/schemas/shift'
import { NextResponse } from "next/server";
import { headers } from 'next/headers';
import { validateDatabaseName, invalidDatabaseResponse } from '@/lib/database-validation'
import { logCreate, logUpdate, logDelete } from '@/services/logs';

export async function GET(request: Request, { params }: { params: { db: string } }) {
    try {
        if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
            return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
        }

        // Validate database name
        if (!validateDatabaseName(params.db)) {
            return invalidDatabaseResponse();
        }

        const dbName = params.db;
        await dbConnect();
        const db = mongoose.connection.useDb(dbName, { useCache: true });
        if (!db.models.shift) {
            db.model('shift', ShiftSchema);
        }

        const shifts = (await db.models.shift.find().select('-_id').sort({ createdAt: 1 }).lean()) as ShiftIface[];

        return NextResponse.json(shifts);
    } catch (err) {
        return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { db: string } }) {
    try {
        if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
            return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
        }
        const body = await request.json();
        if (!params.db) {
            return NextResponse.json({ ERROR: 'Database parameter is required' }, { status: 400 });
        }

        // Validate database name
        if (!validateDatabaseName(params.db)) {
            return invalidDatabaseResponse();
        }

        const fields = (body.fields) ? body.fields.join(' ') : '';
        const dbName = params.db;
        await dbConnect();
        const db = mongoose.connection.useDb(dbName, { useCache: true });
        if (!db.models.shift) {
            db.model('shift', ShiftSchema);
        }

        const shifts = (await db.models.shift.find(body.filter).select(fields).sort(body.sort).lean()) as ShiftIface[];

        return NextResponse.json(shifts);
    } catch (err) {
        return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: { db: string | undefined } }) {
    try {
        if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
            return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
        }
        const body: ShiftIface = await request.json();
        if (!params.db) {
            return NextResponse.json({ ERROR: 'Database parameter is required' }, { status: 400 });
        }

        // Validate database name
        if (!validateDatabaseName(params.db)) {
            return invalidDatabaseResponse();
        }

        if (!body.name) {
            return NextResponse.json(`Shift name is missing!`);
        } else if (!body.startTime) {
            return NextResponse.json(`Start time is missing!`);
        } else if (!body.endTime) {
            return NextResponse.json(`End time is missing!`);
        }

        // Validate time format
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(body.startTime)) {
            return NextResponse.json(`Invalid start time format. Use HH:MM (24-hour)`);
        }
        if (!timeRegex.test(body.endTime)) {
            return NextResponse.json(`Invalid end time format. Use HH:MM (24-hour)`);
        }

        // Validate time logic (start time should be before end time, considering overnight shifts)
        const [startHour, startMin] = body.startTime.split(':').map(Number);
        const [endHour, endMin] = body.endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        // Allow overnight shifts (end time can be before start time)
        if (startMinutes === endMinutes) {
            return NextResponse.json(`Start time and end time cannot be the same`);
        }

        const filter = {
            name: body.name,
        }

        const dbName = params.db;

        await dbConnect();
        const db = mongoose.connection.useDb(dbName, { useCache: true });
        if (!db.models.shift) {
            db.model('shift', ShiftSchema);
        }

        // Get old value for logging
        const oldShift = await db.models.shift.findOne(filter).lean() as ShiftIface;

        const res = await db.models.shift.findOneAndUpdate(filter, body, {
            new: true,
            upsert: true,
            includeResultMetadata: true
        });

        // Log shift update/create
        const loggerUser = 'admin'; // Since we don't have session info in API routes, use admin as default
        if (oldShift) {
            await logUpdate(
                loggerUser,
                'SHIFT',
                { name: oldShift.name, startTime: oldShift.startTime, endTime: oldShift.endTime },
                { name: res.value.name, startTime: res.value.startTime, endTime: res.value.endTime },
                params.db
            );
        } else {
            await logCreate(
                loggerUser,
                'SHIFT',
                { name: res.value.name, startTime: res.value.startTime, endTime: res.value.endTime },
                params.db
            );
        }

        return NextResponse.json(res);
    } catch (err) {
        return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { db: string | undefined } }) {
    try {
        if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
            return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
        }
        const body: ShiftIface = await request.json();
        if (!params.db) {
            return NextResponse.json({ ERROR: 'Database parameter is required' }, { status: 400 });
        }

        // Validate database name
        if (!validateDatabaseName(params.db)) {
            return invalidDatabaseResponse();
        }

        if (!body.name) {
            return NextResponse.json(`Shift name is missing!`);
        }

        const filter = {
            name: body.name
        }

        const dbName = params.db;

        await dbConnect();
        const db = mongoose.connection.useDb(dbName, { useCache: true });
        if (!db.models.shift) {
            db.model('shift', ShiftSchema);
        }

        const res = await db.models.shift.findOneAndDelete(filter);

        // Log shift deletion
        if (res) {
            const deletedShift = res as unknown as ShiftIface;
            await logDelete(
                'admin', // Since we don't have session info in API routes, use admin as default
                'SHIFT',
                { name: deletedShift.name, startTime: deletedShift.startTime, endTime: deletedShift.endTime },
                params.db
            );
        }

        return NextResponse.json(res);
    } catch (err) {
        return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
    }
}
