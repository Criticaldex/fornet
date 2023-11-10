import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import centerSchema from '@/schemas/centers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
   try {
      const body = await request.json();
      const fields = (body.fields) ? body.fields.join(' ') : '';
      const dbName = body.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.center) {
         db.model('center', centerSchema);
      }
      const centros: any = await db.models.center.findOne({}).select(fields).lean();
      return NextResponse.json(centros);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}