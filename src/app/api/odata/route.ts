import { NextResponse } from 'next/server';
import { executeODataQuery } from '@/services/odata';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const results = await executeODataQuery(body);
        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Error desconocido' },
            { status: 500 }
        );
    }
}