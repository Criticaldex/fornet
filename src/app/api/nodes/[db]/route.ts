import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import NodeSchema, { NodeIface } from '@/schemas/node'
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
      if (!db.models.node) {
         db.model('node', NodeSchema);
      }

      const nodes = (await db.models.node.find().select('-_id').lean()) as NodeIface[];
      // const res = nodes.map((node) => (node.name));

      return NextResponse.json(nodes);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}