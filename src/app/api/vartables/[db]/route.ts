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
      }

      if (!body.line) {
         return NextResponse.json(`Line Missing!`);
      }

      if (!body.name) {
         return NextResponse.json(`Name Missing!`);
      }

      const filter = {
         line: body.line,
         name: body.name
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
      } else if (!body._id) {
         return NextResponse.json(`ID Missing!`);
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.vartable) {
         db.model('vartable', VartableSchema);
      }
      const res = await db.models.vartable.findByIdAndDelete(body._id);
      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}