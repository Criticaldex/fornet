import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import userSchema, { UserIface } from '@/schemas/user'
import indicatorSchema, { IndicatorIface } from '@/schemas/indicator'
import { NextResponse } from "next/server";
import { hash } from 'bcryptjs';

export async function GET(request: Request, { params }: { params: { line: string, name: string } }) {
   try {
      const dbName = 'empresa2';
      const filter = {
         "line": params.line, "name": params.name
      };
      const fields = [
         "-_id",
         "value",
         "timestamp"
      ];

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.value) {
         db.model('value', indicatorSchema);
      }
      const values = await db.models.value.find(filter).select(fields).sort('timestamp').lean();
      const liveValues = values.map((val) => ([val.timestamp, val.value]));
      return NextResponse.json(liveValues);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}