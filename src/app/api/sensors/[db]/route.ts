import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import SensorSchema, { SensorIface } from '@/schemas/sensor'
import { NextResponse } from "next/server";
import { headers } from 'next/headers';

export async function GET(request: Request, { params }: { params: { db: string } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' });
      }
      const dbName = params.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.sensor) {
         db.model('sensor', SensorSchema);
      }

      const sensors = (await db.models.sensor.find().select('-_id').lean()) as SensorIface[];

      return NextResponse.json(sensors);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}

export async function POST(request: Request, { params }: { params: { db: string } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' });
      }
      const body = await request.json();
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      }
      const fields = (body.fields) ? body.fields.join(' ') : '';
      const dbName = params.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.sensor) {
         db.model('sensor', SensorSchema);
      }

      const sensors = (await db.models.sensor.find(body.filter).select(fields).sort(body.sort).lean()) as SensorIface[];

      return NextResponse.json(sensors);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}

export async function PATCH(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' });
      }
      const body: SensorIface = await request.json();
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      } else if (!body.line) {
         return NextResponse.json(`Line Missing!`);
      } else if (!body.name) {
         return NextResponse.json(`Name Missing!`);
      } else if (!body.plc_name) {
         return NextResponse.json(`PLC_Name Missing!`);
      }

      const filter = {
         line: body.line,
         name: body.name
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.sensor) {
         db.model('sensor', SensorSchema);
      }
      const res = await db.models.sensor.findOneAndUpdate(filter, body, {
         new: true,
         upsert: true,
         includeResultMetadata: true
      });

      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}

export async function DELETE(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' });
      }
      const body: SensorIface = await request.json();
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      } else if (!body.line) {
         return NextResponse.json(`Line Missing!`);
      } else if (!body.plc_name) {
         return NextResponse.json(`PLC_Name Missing!`);
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.sensor) {
         db.model('sensor', SensorSchema);
      }
      const res = await db.models.sensor.deleteMany(body);
      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}