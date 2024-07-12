import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import LabelSchema, { LabelIface } from '@/schemas/label'
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { db: string } }) {
   try {
      const dbName = params.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.label) {
         db.model('label', LabelSchema);
      }

      const labels = (await db.models.label.find().lean()) as LabelIface[];

      return NextResponse.json(labels);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}

export async function PATCH(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      const body: LabelIface = await request.json();
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
      if (!db.models.label) {
         db.model('label', LabelSchema);
      }
      const res = await db.models.label.findOneAndUpdate(filter, body, {
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
      const body: LabelIface = await request.json();
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      } else if (!body._id) {
         return NextResponse.json(`ID Missing!`);
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.label) {
         db.model('label', LabelSchema);
      }
      const res = await db.models.label.findByIdAndDelete(body._id);
      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}