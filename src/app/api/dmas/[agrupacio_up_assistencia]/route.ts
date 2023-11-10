import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import DMASchema from '@/schemas/dma'
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { agrupacio_up_assistencia: string } }) {
   try {
      const dbName = 'DMA';
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.dma) {
         db.model('dma', DMASchema);
      }
      const dma = await db.models.dma.findOne(params).select('-_id').lean();
      return NextResponse.json(dma);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}