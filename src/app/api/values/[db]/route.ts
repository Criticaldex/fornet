import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import { NextResponse } from 'next/server'
import indicatorSchema, { IndicatorIface } from '@/schemas/indicator'
import valueSchema, { ValueIface } from '@/schemas/value'

export async function POST(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      const body = await request.json()
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      }
      const fields = (body.fields) ? body.fields.join(' ') : '';
      const dbName = params.db;
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

export async function DELETE(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      const body: ValueIface = await request.json();
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      } else if (!body.line || !body.name) {
         return NextResponse.json(`Line and name required!`);
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.value) {
         db.model('value', valueSchema);
      }
      const res = await db.models.value.deleteMany({ line: body.line, name: body.name });
      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}