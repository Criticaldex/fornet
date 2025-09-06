import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import { NextResponse } from 'next/server'
import summarySchema, { SummaryIface } from '@/schemas/summary'
import { headers } from 'next/headers'
import { validateDatabaseName, invalidDatabaseResponse } from '@/lib/database-validation'

/**
 * Ensures the summary model exists with proper indexes synchronized
 * @param db - The database connection
 * @param dbName - The database name for logging
 * @returns The summary model
 */
async function ensureSummaryModel(db: any, dbName: string) {
   // Create model if it doesn't exist
   if (!db.models.summary) {
      db.model('summary', summarySchema);
      console.log(`📝 Created summary model for ${dbName}`);
   }

   // Always ensure indexes exist, regardless of when model was created
   try {
      const collection = db.collection('summaries');

      // Get current indexes
      const indexes = await collection.listIndexes().toArray();
      console.log(`🔍 Current indexes for ${dbName}:`, indexes.map((idx: any) => ({ name: idx.name, key: idx.key, unique: idx.unique })));

      // Check if the correct unique index exists
      const correctUniqueIndex = indexes.find((index: any) =>
         index.unique === true &&
         index.key &&
         index.key.line === 1 &&
         index.key.plc_name === 1 &&
         index.key.name === 1 &&
         index.key.shift === 1 &&
         index.key.year === 1 &&
         index.key.month === 1 &&
         index.key.day === 1
      );

      if (!correctUniqueIndex) {
         // Drop any old unique indexes that might conflict
         for (const index of indexes) {
            if (index.unique && index.name !== '_id_') {
               console.log(`🗑️  Dropping old unique index: ${index.name} for ${dbName}`);
               try {
                  await collection.dropIndex(index.name);
               } catch (dropError) {
                  console.warn(`⚠️  Could not drop index ${index.name}:`, dropError);
               }
            }
         }

         // Create the correct unique index
         await collection.createIndex(
            { line: 1, plc_name: 1, name: 1, shift: 1, year: 1, month: 1, day: 1 },
            { unique: true, name: 'summaries_unique_compound_index' }
         );
         console.log(`✅ Created unique compound index for summaries in ${dbName}`);
      } else {
         console.log(`✅ Correct unique index already exists for summaries in ${dbName}`);
      }

   } catch (indexError) {
      console.error(`❌ Error managing indexes for ${dbName}:`, indexError);

      // Fallback: try syncIndexes
      try {
         await db.models.summary.syncIndexes();
         console.log(`✅ Fallback: Used syncIndexes for ${dbName}`);
      } catch (syncError) {
         console.error(`❌ Fallback syncIndexes also failed for ${dbName}:`, syncError);
      }
   }

   return db.models.summary;
}

export async function GET(request: Request, { params }: { params: { db: string } }) {
   try {
      // if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
      //    return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      // }

      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      const dbName = params.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      await ensureSummaryModel(db, dbName);

      const sensors: any = await db.models.summary.find().select('-_id').lean();

      return NextResponse.json(sensors);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}

export async function POST(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }
      const body = await request.json()
      if (!params.db) {
         return NextResponse.json({ ERROR: 'Database parameter is required' }, { status: 400 });
      }

      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      const fields = (body.fields) ? body.fields.join(' ') : '';
      const dbName = params.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      await ensureSummaryModel(db, dbName);

      const indicator: any = await db.models.summary.find(body.filter).select(fields).sort(body.sort).lean();
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
      const body: SummaryIface = await request.json()
      if (!params.db) {
         return NextResponse.json({ ERROR: 'Database parameter is required' }, { status: 400 });
      }

      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      const dbName = params.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      await ensureSummaryModel(db, dbName);

      const res = await db.models.summary.insertMany(body);
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
      const body: SummaryIface = await request.json();
      if (!params.db) {
         return NextResponse.json({ ERROR: 'Database parameter is required' }, { status: 400 });
      }

      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      if (!body.line) {
         return NextResponse.json({ ERROR: 'Line Missing!' }, { status: 400 });
      } else if (!body.plc_name) {
         return NextResponse.json({ ERROR: 'PLC Name Missing!' }, { status: 400 });
      }

      const dbName = params.db;

      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      await ensureSummaryModel(db, dbName);

      const res = await db.models.summary.deleteMany(body);
      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}

// PUT endpoint for manual index management/verification
export async function PUT(request: Request, { params }: { params: { db: string | undefined } }) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }

      if (!params.db) {
         return NextResponse.json({ ERROR: 'Database parameter is required' }, { status: 400 });
      }

      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      const dbName = params.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });

      // Force model creation and index synchronization
      await ensureSummaryModel(db, dbName);

      // Get current indexes for verification
      const collection = db.collection('summaries');
      const indexes = await collection.listIndexes().toArray();

      return NextResponse.json({
         message: 'Index synchronization completed',
         database: dbName,
         indexes: indexes.map((index: any) => ({
            name: index.name,
            key: index.key,
            unique: index.unique || false
         }))
      });
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}