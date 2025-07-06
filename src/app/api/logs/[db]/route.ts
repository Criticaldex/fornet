import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import { NextResponse } from 'next/server'
import logSchema, { LogIface } from '@/schemas/log'
import { headers } from 'next/headers'

export async function POST(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }
      const body = await request.json()
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      }
      const fields = (body.fields) ? body.fields.join(' ') : '';
      const dbName = params.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.log) {
         db.model('log', logSchema);
      }
      const logs: any = await db.models.log.find(body.filter).select(fields).sort(body.sort).lean();
      return NextResponse.json(logs);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}

export async function PATCH(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }
      const body: LogIface = await request.json()
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      } else if (!body.user) {
         return NextResponse.json(`user Missing!`);
      } else if (!body.resource) {
         return NextResponse.json(`resource Missing!`);
      } else if (!body.timestamp) {
         return NextResponse.json(`timestamp Missing!`);
      }

      const dbName = params.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.log) {
         db.model('log', logSchema);
      }
      const res = await db.models.log.create(body);
      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}

export async function DELETE(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }
      const body: LogIface = await request.json();
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.log) {
         db.model('log', logSchema);
      }
      const res = await db.models.log.deleteMany(body);
      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}