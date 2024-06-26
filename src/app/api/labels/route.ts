import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import labelSchema, { LabelIface } from '@/schemas/label'
import { NextResponse } from "next/server";
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
   try {
      const body = await request.json();
      if (!body.db) {
         return new NextResponse(
            JSON.stringify({ message: "db field is mandatory!" }),
            { status: 401 }
         );
      }
      const dbName = body.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.label) {
         db.model('label', labelSchema);
      }
      const labels = await db.models.label.find().lean();
      return NextResponse.json(labels);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}

// export async function GET(request: Request) {
//    try {
//       const { searchParams } = new URL(request.url)
//       const database = searchParams.get('db');
//       const filter = database ? { db: database } : {}
//       const dbName = 'Auth';
//       await dbConnect();
//       const db = mongoose.connection.useDb(dbName, { useCache: true });
//       if (!db.models.label) {
//          db.model('label', labelSchema);
//       }

//       const users = (await db.models.user.find(filter).select('-_id -hash').lean()) as LabelIface[];

//       return NextResponse.json(users);
//    } catch (err) {
//       return NextResponse.json({ ERROR: (err as Error).message });
//    }
// }

// export async function PATCH(request: Request) {
//    try {
//       const body: LabelIface = await request.json();
//       if (!body.email) {
//          return NextResponse.json(`Email Obligatori!`);
//       }
//       const filter = { email: body.email }
//       const dbName = 'Auth';
//       await dbConnect();
//       const db = mongoose.connection.useDb(dbName, { useCache: true });
//       if (!db.models.user) {
//          db.model('user', userSchema);
//       }
//       const res = await db.models.user.findOneAndUpdate(filter, body, {
//          new: true,
//          upsert: true,
//          rawResult: true
//       }).lean();
//       const { hash, ...userWithoutHash } = res.value;
//       res.value = userWithoutHash;
//       return NextResponse.json(res);
//    } catch (err) {
//       return NextResponse.json({ ERROR: (err as Error).message });
//    }
// }