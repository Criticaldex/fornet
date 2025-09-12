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

      // Log sensor update/create with all schema fields
      const loggerUser = 'admin'; // Since we don't have session info in API routes, use admin as default

      // Helper function to extract all sensor fields from schema
      const extractAllSensorFields = (sensor: SensorIface) => ({
         _id: sensor._id,
         line: sensor.line,
         name: sensor.name,
         plc_name: sensor.plc_name,
         unit: sensor.unit,
         address: sensor.address,
         read: sensor.read,
         write: sensor.write,
         dataType: sensor.dataType,
         autoinc: sensor.autoinc,
         maxrange: sensor.maxrange,
         minrange: sensor.minrange,
         node: sensor.node
      });

      if (oldSensor) {
         await logUpdate(
            loggerUser,
            'SENSOR',
            extractAllSensorFields(oldSensor),
            extractAllSensorFields(res.value),
            params.db
         );
      } else {
         await logCreate(
            loggerUser,
            'SENSOR',
            extractAllSensorFields(res.value),
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

      // Get sensors that will be deleted for complete logging
      const sensorsToDelete = await db.models.sensor.find(body).lean() as SensorIface[];

      const res = await db.models.sensor.deleteMany(body);

      // Log sensor deletion with all sensor fields
      if (res && res.deletedCount > 0) {
         // Helper function to extract all sensor fields from schema
         const extractAllSensorFields = (sensor: SensorIface) => ({
            _id: sensor._id,
            line: sensor.line,
            name: sensor.name,
            plc_name: sensor.plc_name,
            unit: sensor.unit,
            address: sensor.address,
            read: sensor.read,
            write: sensor.write,
            dataType: sensor.dataType,
            autoinc: sensor.autoinc,
            maxrange: sensor.maxrange,
            minrange: sensor.minrange,
            node: sensor.node
         });

         await logDelete(
            'admin', // Since we don't have session info in API routes, use admin as default
            'SENSOR',
            {
               deletedCount: res.deletedCount,
               query: { line: body.line, plc_name: body.plc_name },
               deletedSensors: sensorsToDelete.map(extractAllSensorFields)
            },
            params.db
         );
      }

      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}