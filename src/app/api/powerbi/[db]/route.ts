import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import PowerBISchema, { PowerBIIface } from '@/schemas/powerbi'
import { NextResponse } from "next/server";
import { headers } from 'next/headers'
import { validateDatabaseName, invalidDatabaseResponse } from '@/lib/database-validation';
import { logUpdate } from '@/services/logs';

export async function GET(request: Request, { params }: { params: { db: string } }) {
    try {
        if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
            return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
        }

        if (!validateDatabaseName(params.db)) {
            return invalidDatabaseResponse();
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
            return NextResponse.json({ ERROR: 'Database parameter is required' }, { status: 400 });
        }

        // Validate database name
        if (!validateDatabaseName(params.db)) {
            return invalidDatabaseResponse();
        }

        const dbName = params.db;

        await dbConnect();
        const db = mongoose.connection.useDb(dbName, { useCache: true });
        if (!db.models.powerbi) {
            db.model('powerbi', PowerBISchema);
        }

        // Get old PowerBI config for logging
        const oldConfig = await db.models.powerbi.findOne({}).lean() as PowerBIIface;

        const res = await db.models.powerbi.findOneAndUpdate({}, body, {
            new: true,
            upsert: true,
            includeResultMetadata: true
        });

        // Log PowerBI configuration update
        const changedFields: string[] = [];
        if (oldConfig) {
            // Compare and identify changed fields
            Object.keys(body).forEach(key => {
                if (oldConfig[key as keyof PowerBIIface] !== body[key as keyof PowerBIIface]) {
                    changedFields.push(key);
                }
            });

            if (changedFields.length > 0) {
                await logUpdate(
                    'admin',
                    'PowerBI',
                    { fields: changedFields.join(', ') },
                    { message: `Updated PowerBI fields: ${changedFields.join(', ')}` },
                    params.db
                );
            }
        }

        return NextResponse.json(res);
    } catch (err) {
        return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
    }
}
