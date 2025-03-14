import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import SensorSchema, { SensorIface } from '@/schemas/sensor'
import { NextResponse } from "next/server";
import { headers } from 'next/headers';


export async function PATCH(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }
      const body: SensorIface = await request.json();
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      } else if (!body.line) {
         return NextResponse.json(`Line Missing!`);
      } else if (!body.plc_name) {
         return NextResponse.json(`PLC_Name Missing!`);
      } else if (!body.node) {
         return NextResponse.json(`Node Missing!`);
      }

      const filter = {
         plc_name: body.plc_name
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.sensor) {
         db.model('sensor', SensorSchema);
      }
      const res = await db.models.sensor.updateMany(filter, body, {
         new: true,
         includeResultMetadata: true
      });

      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}