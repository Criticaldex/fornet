import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import DMASchema from '@/schemas/dma'
import { NextResponse } from "next/server";

export async function POST(request: Request) {
   try {
      const body = await request.json();
      const fields = (body.fields) ? body.fields.join(' ') : '';
      const dbName = 'DMA';
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.dma) {
         db.model('dma', DMASchema);
      }
      const dma: any = await db.models.dma.find(body.filter).select(fields).lean();
      return NextResponse.json(dma);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}