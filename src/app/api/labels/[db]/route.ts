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