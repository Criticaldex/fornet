import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import indicatorSchema, { IndicatorIface } from '@/schemas/indicator'
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { line: string, name: string, interval: number } }) {
   try {
      const dbName = 'empresa2';
      let timestamp = Math.floor(Date.now() - (params.interval * 60 * 60 * 1000)).toString();

      const filter = {
         "line": params.line, "name": params.name, "timestamp": { $gte: parseInt(timestamp) }
      };

      const fields = [
         "-_id",
         "value",
         "timestamp"
      ];

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: false });
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