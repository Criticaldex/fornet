import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import SensorSchema, { SensorIface } from '@/schemas/sensor'
import { NextResponse } from "next/server";
import { headers } from 'next/headers';
import { validateDatabaseName, invalidDatabaseResponse } from '@/lib/database-validation'
import { logCreate, logUpdate, logDelete } from '@/services/logs';

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
      if (!db.models.sensor) {
         db.model('sensor', SensorSchema);
      }

      const sensors = (await db.models.sensor.find().select('-_id').lean()) as SensorIface[];

      return NextResponse.json(sensors);
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
      if (!db.models.sensor) {
         db.model('sensor', SensorSchema);
      }

      const sensors = (await db.models.sensor.find(body.filter).select(fields).sort(body.sort).lean()) as SensorIface[];

      return NextResponse.json(sensors);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}

export async function PATCH(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }
      const body: SensorIface = await request.json();
      if (!params.db) {
         return NextResponse.json({ ERROR: 'Database parameter is required' }, { status: 400 });
      }

      // Validate database name
      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      if (!body.line) {
         return NextResponse.json(`Line Missing!`);
      } else if (!body.name) {
         return NextResponse.json(`Name Missing!`);
      } else if (!body.plc_name) {
         return NextResponse.json(`PLC_Name Missing!`);
      }

      const filter = {
         line: body.line,
         name: body.name
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.sensor) {
         db.model('sensor', SensorSchema);
      }

      // Get old value for logging
      const oldSensor = await db.models.sensor.findOne(filter).lean() as SensorIface;

      const res = await db.models.sensor.findOneAndUpdate(filter, body, {
         new: true,
         upsert: true,
         includeResultMetadata: true
      });

      // Log sensor update/create
      const loggerUser = 'admin'; // Since we don't have session info in API routes, use admin as default
      if (oldSensor) {
         await logUpdate(
            loggerUser,
            'SENSOR',
            { name: oldSensor.name, line: oldSensor.line, plc_name: oldSensor.plc_name, dataType: oldSensor.dataType },
            { name: res.value.name, line: res.value.line, plc_name: res.value.plc_name, dataType: res.value.dataType },
            params.db
         );
      } else {
         await logCreate(
            loggerUser,
            'SENSOR',
            { name: res.value.name, line: res.value.line, plc_name: res.value.plc_name, dataType: res.value.dataType },
            params.db
         );
      }

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
      const body: SensorIface = await request.json();
      if (!params.db) {
         return NextResponse.json({ ERROR: 'Database parameter is required' }, { status: 400 });
      }

      // Validate database name
      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      if (!body.line) {
         return NextResponse.json(`Line Missing!`);
      } else if (!body.plc_name) {
         return NextResponse.json(`PLC_Name Missing!`);
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.sensor) {
         db.model('sensor', SensorSchema);
      }

      const res = await db.models.sensor.deleteMany(body);

      // Log sensor deletion
      if (res && res.deletedCount > 0) {
         await logDelete(
            'admin', // Since we don't have session info in API routes, use admin as default
            'SENSOR',
            { line: body.line, plc_name: body.plc_name, deletedCount: res.deletedCount },
            params.db
         );
      }

      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}