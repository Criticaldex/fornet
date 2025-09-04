import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import NodeSchema, { NodeIface } from '@/schemas/node'
import { NextResponse } from "next/server";
import { headers } from 'next/headers';
import { validateDatabaseName, invalidDatabaseResponse } from '@/lib/database-validation'

export async function GET(request: Request, { params }: { params: { db: string } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }

      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
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
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}

export async function PATCH(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }
      const body: NodeIface = await request.json();
      if (!params.db) {
         return NextResponse.json({ ERROR: 'Database parameter is required' }, { status: 400 });
      }

      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      if (body.synced == undefined) {
         return NextResponse.json({ ERROR: 'synced Missing!' }, { status: 400 });
      } else if (body.name == undefined) {
         return NextResponse.json({ ERROR: 'name Missing!' }, { status: 400 });
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.node) {
         db.model('node', NodeSchema);
      }
      const res = await db.models.node.findOneAndUpdate({ name: body.name }, body, {
         new: true,
         upsert: false,
         includeResultMetadata: true
      });

      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}