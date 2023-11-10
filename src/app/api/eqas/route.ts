import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import eqaSchema from '@/schemas/eqa'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
   try {
      const body = await request.json()
      const fields = (body.fields) ? body.fields.join(' ') : '';
      const dbName = body.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.eqa) {
         db.model('eqa', eqaSchema);
      }
      const eqas: any = await db.models.eqa.find(body.filter).select(fields).lean();
      return NextResponse.json(eqas);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}