import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import IQFSchema from '@/schemas/iqf'
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { any: string, up: string } }) {
   try {
      const dbName = 'IQF';
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.iqf) {
         db.model('iqf', IQFSchema);
      }
      const iqf = await db.models.iqf.findOne(params).select('-_id').lean();

      return NextResponse.json(iqf);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}