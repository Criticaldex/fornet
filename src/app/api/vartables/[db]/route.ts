import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import VartableSchema, { VartableIface } from '@/schemas/vartable'
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { db: string } }) {
   try {
      const dbName = params.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.vartable) {
         db.model('vartable', VartableSchema);
      }

      const vartables = (await db.models.vartable.find().lean()) as VartableIface[];

      return NextResponse.json(vartables);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}

export async function PATCH(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      const body: VartableIface = await request.json();
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      } else if (!body.line) {
         return NextResponse.json(`line Missing!`);
      } else if (!body.plc_name) {
         return NextResponse.json(`plc_name Missing!`);
      } else if (!body.name) {
         return NextResponse.json(`name Missing!`);
      }

      const filter = {
         line: body.line,
         name: body.name,
         plc_name: body.plc_name
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.vartable) {
         db.model('vartable', VartableSchema);
      }
      const res = await db.models.vartable.findOneAndUpdate(filter, body, {
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
      const body: VartableIface = await request.json();
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      } else if (!body.line) {
         return NextResponse.json(`line Missing!`);
      } else if (!body.plc_name) {
         return NextResponse.json(`plc_name Missing!`);
      } else if (!body.name) {
         return NextResponse.json(`name Missing!`);
      }

      const filter = {
         line: body.line,
         name: body.name,
         plc_name: body.plc_name
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.vartable) {
         db.model('vartable', VartableSchema);
      }
      const res = await db.models.vartable.findOneAndDelete(filter);
      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}