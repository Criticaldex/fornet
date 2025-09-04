import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import { NextResponse } from 'next/server'
import valueSchema, { ValueIface } from '@/schemas/value'
import { headers } from 'next/headers'
import { validateDatabaseName, invalidDatabaseResponse } from '@/lib/database-validation';

export async function POST(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }
      const body = await request.json()
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      }

      // Validate database name
      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      const fields = (body.fields) ? body.fields.join(' ') : '';
      const dbName = params.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.value) {
         db.model('value', valueSchema);
      }
      const indicator: any = await db.models.value.find(body.filter).select(fields).sort(body.sort).lean();
      return NextResponse.json(indicator);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}

export async function PATCH(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }
      const body: ValueIface = await request.json()
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      }

      // Validate database name
      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      const dbName = params.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.value) {
         db.model('value', valueSchema);
      }
      const res = await db.models.value.create(body);
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
      const body: ValueIface = await request.json();
      if (!params.db) {
         return NextResponse.json(`DB Missing!`);
      }

      // Validate database name
      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.value) {
         db.model('value', valueSchema);
      }
      const res = await db.models.value.deleteMany(body);
      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}