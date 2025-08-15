import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import PowerBISchema, { PowerBIIface } from '@/schemas/powerbi'
import { NextResponse } from "next/server";
import { headers } from 'next/headers';

export async function GET(request: Request, { params }: { params: { db: string } }) {
    try {
        if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
            return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
        }
        const dbName = params.db;
        await dbConnect();
        const db = mongoose.connection.useDb(dbName, { useCache: true });
        if (!db.models.powerbi) {
            db.model('powerbi', PowerBISchema);
        }

        const powerbi = await db.models.powerbi.findOne().select('-_id').lean() as PowerBIIface;

        return NextResponse.json(powerbi);
    } catch (err) {
        return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: { db: string | undefined } }) {
    try {
        if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
            return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
        }
        const body: PowerBIIface = await request.json();
        if (!params.db) {
            return NextResponse.json(`DB Missing!`);
        }

        const dbName = params.db;

        await dbConnect();
        const db = mongoose.connection.useDb(dbName, { useCache: true });
        if (!db.models.powerbi) {
            db.model('powerbi', PowerBISchema);
        }
        const res = await db.models.powerbi.findOneAndUpdate({}, body, {
            new: true,
            upsert: true,
            includeResultMetadata: true
        });

        return NextResponse.json(res);
    } catch (err) {
        return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
    }
}
