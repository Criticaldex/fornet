import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import indicatorSchema, { IndicatorIface } from '@/schemas/indicator'
import { NextResponse } from "next/server";

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
      const values = await db.models.value.find(filter).select(fields).limit(1).sort([['timestamp', 'desc']]).lean();
      if (values[0].value === true) values[0].value = 1
      else if (values[0].value === false) values[0].value = 0

      const liveValues = [[values[0].timestamp, values[0].value], [values[0].timestamp, values[0].value]];
      return NextResponse.json(liveValues);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}