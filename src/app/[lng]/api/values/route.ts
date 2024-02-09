import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import indicatorSchema, { IndicatorIface } from '@/schemas/indicator'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
   try {
      const body = await request.json()
      const fields = (body.fields) ? body.fields.join(' ') : '';
      const dbName = body.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.value) {
         db.model('value', indicatorSchema);
      }
      const indicator: any = await db.models.value.find(body.filter).select(fields).sort(body.sort).lean();
      return NextResponse.json(indicator);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}