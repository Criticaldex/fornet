import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import MqttSchema, { MqttIface } from '@/schemas/mqtt'
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
      if (!db.models.mqtt) {
         db.model('mqtt', MqttSchema);
      }

      const mqtts = (await db.models.mqtt.find().lean()) as MqttIface[];

      return NextResponse.json(mqtts);
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
      if (!db.models.mqtt) {
         db.model('mqtt', MqttSchema);
      }

      const mqtts = (await db.models.mqtt.find(body.filter).select(fields).sort(body.sort).lean()) as MqttIface[];

      return NextResponse.json(mqtts);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}

export async function PATCH(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' });
      }
      const { _id, ...body }: MqttIface = await request.json();
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      } else if (!body.line) {
         return NextResponse.json(`line Missing!`);
      } else if (!body.ip) {
         return NextResponse.json(`ip Missing!`);
      } else if (!body.name) {
         return NextResponse.json(`name Missing!`);
      } else if (!body.plc) {
         return NextResponse.json(`plc Missing!`);
      } else if (!body.sensor) {
         return NextResponse.json(`sensor Missing!`);
      } else if (!body.value) {
         return NextResponse.json(`value Missing!`);
      }

      const filter = {
         name: body.name,
         line: body.line,
         plc: body.plc,
         sensor: body.sensor
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.mqtt) {
         db.model('mqtt', MqttSchema);
      }
      const res = await db.models.mqtt.findOneAndUpdate(filter, body, {
         new: true,
         upsert: true,
         rawResult: true
      }).lean();

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
      const body: MqttIface = await request.json();
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      } else if (!body.line) {
         return NextResponse.json(`line Missing!`);
      } else if (!body.name) {
         return NextResponse.json(`name Missing!`);
      } else if (!body.plc) {
         return NextResponse.json(`plc Missing!`);
      } else if (!body.sensor) {
         return NextResponse.json(`sensor Missing!`);
      }

      const filter = {
         line: body.line,
         name: body.name,
         plc: body.plc,
         sensor: body.sensor
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.mqtt) {
         db.model('mqtt', MqttSchema);
      }
      const res = await db.models.mqtt.findOneAndDelete(filter);
      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}