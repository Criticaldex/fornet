import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import PlcSchema, { PlcIface } from '@/schemas/plc'
import { NextResponse } from "next/server";
import { headers } from 'next/headers';
import { validateDatabaseName, invalidDatabaseResponse } from '@/lib/database-validation'

export async function GET(request: Request, { params }: { params: { db: string } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }

      // Validate database name
      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      const dbName = params.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.plc) {
         db.model('plc', PlcSchema);
      }

      const plcs = (await db.models.plc.find().lean()) as PlcIface[];

      return NextResponse.json(plcs);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}

export async function POST(request: Request, { params }: { params: { db: string } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }
      const body = await request.json();
      if (!params.db) {
         return NextResponse.json({ ERROR: 'Database parameter is required' }, { status: 400 });
      }

      // Validate database name
      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      const fields = (body.fields) ? body.fields.join(' ') : '';
      const dbName = params.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.plc) {
         db.model('plc', PlcSchema);
      }

      const plcs = (await db.models.plc.find(body.filter).select(fields).sort(body.sort).lean()) as PlcIface[];

      return NextResponse.json(plcs);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}

export async function PATCH(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }
      const { _id, ...body }: PlcIface = await request.json();
      if (!params.db) {
         return NextResponse.json({ ERROR: 'Database parameter is required' }, { status: 400 });
      }

      // Validate database name
      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      if (!body.line) {
         return NextResponse.json(`line Missing!`);
      } else if (!body.ip) {
         return NextResponse.json(`ip Missing!`);
      } else if (!body.name) {
         return NextResponse.json(`name Missing!`);
      } else if (!body.type) {
         return NextResponse.json(`type Missing!`);
      }

      const filter = {
         name: body.name,
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.plc) {
         db.model('plc', PlcSchema);
      }
      const res = await db.models.plc.findOneAndUpdate(filter, body, {
         new: true,
         upsert: true,
         includeResultMetadata: true
      });

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
      const body: PlcIface = await request.json();
      if (!params.db) {
         return NextResponse.json({ ERROR: 'Database parameter is required' }, { status: 400 });
      }

      // Validate database name
      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      if (!body.line) {
         return NextResponse.json(`line Missing!`);
      } else if (!body.name) {
         return NextResponse.json(`name Missing!`);
      }

      const filter = {
         line: body.line,
         name: body.name
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.plc) {
         db.model('plc', PlcSchema);
      }
      const res = await db.models.plc.findOneAndDelete(filter);
      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}