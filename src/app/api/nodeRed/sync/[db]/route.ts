import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import SyncSchema, { SyncIface } from '@/schemas/sync'
import { NextResponse } from "next/server";
import { headers } from 'next/headers';

export async function GET(request: Request, { params }: { params: { db: string } }) {
    try {
        if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
            return NextResponse.json({ ERROR: 'Bad Auth' });
        }
        const dbName = params.db;
        await dbConnect();
        const db = mongoose.connection.useDb(dbName, { useCache: true });

        if (!db.models.sync) {
            db.model('sync', SyncSchema);
        }

        const sync = (await db.models.sync.find().lean()) as SyncIface[];
        return NextResponse.json(sync);
    } catch (err) {
        return NextResponse.json({ ERROR: (err as Error).message });
    }
}

export async function POST(request: Request, { params }: { params: { db: string | undefined } }) {
    try {
        if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
            return NextResponse.json({ ERROR: 'Bad Auth' });
        }
        const body: SyncIface = await request.json();
        if (!params.db) {
            return NextResponse.json(`DB Missing!`);
        } else if (body.synced == undefined) {
            return NextResponse.json(`synced Missing!`);
        }

        const dbName = params.db;

        await dbConnect();
        const db = mongoose.connection.useDb(dbName, { useCache: true });
        if (!db.models.sync) {
            db.model('sync', SyncSchema);
        }
        const res = await db.models.sync.findOneAndUpdate({}, body, {
            new: true,
            upsert: true,
            rawResult: true
        }).lean();

        return NextResponse.json(res);
    } catch (err) {
        return NextResponse.json({ ERROR: (err as Error).message });
    }
}