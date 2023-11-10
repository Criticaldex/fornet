import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import CallSchema from '@/schemas/call'
import { NextResponse } from "next/server";

export async function POST(request: Request) {
   try {
      const body = await request.json();
      const fields = (body.fields) ? body.fields.join(' ') : '';
      const dbName = body.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.call) {
         db.model('call', CallSchema);
      }
      const call: any = await db.models.call.find(body.filter).select(fields).lean();
      return NextResponse.json(call);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}