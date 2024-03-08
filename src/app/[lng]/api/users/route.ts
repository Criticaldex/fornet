import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import userSchema, { UserIface } from '@/schemas/user'
import { NextResponse } from "next/server";
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
   try {
      const session = true;

      if (!session) {
         return new NextResponse(
            JSON.stringify({ message: "You are not logged in" }),
            { status: 401 }
         );
      }
      const body: UserIface = await request.json();
      const saltRounds = 10;
      const aYearFromNow = new Date();
      aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);
      const fields = {
         name: (body.name) ? body.name : null,
         lastname: (body.lastname) ? body.lastname : null,
         email: (body.email) ? body.email : null,
         hash: (body.password) ? await hash(body.password, saltRounds) : null,
         license: {
            token: null,
            start: (body.license) ? new Date().valueOf() : null,
            end: (body.license) ? aYearFromNow.valueOf() : null,
         },
         db: (body.db) ? body.db : null,
         role: (body.role) ? body.role : null
      };

      const dbName = 'Auth';
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.user) {
         db.model('user', userSchema);
      }
      const user = await db.models.user.create(fields);
      return NextResponse.json(`Usuari ${user.email} creat!`);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}

export async function GET(request: Request) {
   try {
      const { searchParams } = new URL(request.url)
      const database = searchParams.get('db');
      const filter = database ? { db: database } : {}
      const dbName = 'Auth';
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.user) {
         db.model('user', userSchema);
      }

      const users = (await db.models.user.find(filter).select('-_id -hash').lean()) as UserIface[];

      return NextResponse.json(users);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}

export async function PATCH(request: Request) {
   try {
      const body: UserIface = await request.json();
      if (!body.email) {
         return NextResponse.json(`Email Obligatori!`);
      }
      const filter = { email: body.email }
      const dbName = 'Auth';
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.user) {
         db.model('user', userSchema);
      }
      const res = await db.models.user.findOneAndUpdate(filter, body, {
         new: true,
         upsert: true,
         rawResult: true
      }).lean();
      const { hash, ...userWithoutHash } = res.value;
      res.value = userWithoutHash;
      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}