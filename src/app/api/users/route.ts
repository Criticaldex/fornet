import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import userSchema, { UserIface } from '@/schemas/user'
import { NextResponse } from "next/server";
import { hash } from 'bcryptjs';
import { headers } from 'next/headers';
import { logCreate, logUpdate } from '@/services/logs';

export async function POST(request: Request) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }
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
         alert: (body.alert) ? body.alert : null,
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

      // Log user creation
      await logCreate(
         fields.email || 'system',
         'USER',
         { email: user.email, name: user.name, role: user.role, db: user.db }
      );

      return NextResponse.json(`Usuari ${user.email} creat!`);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}

export async function GET(request: Request) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }
      const { searchParams } = new URL(request.url)
      const database = searchParams.get('db');
      const filter = database ? { db: database, role: { $ne: 0 } } : {}
      const dbName = 'Auth';
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.user) {
         db.model('user', userSchema);
      }

      const users = (await db.models.user.find(filter).select('-_id -hash').lean()) as UserIface[];

      return NextResponse.json(users);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}

export async function PATCH(request: Request) {
   try {
      if (headers().get('token') != process.env.NEXT_PUBLIC_API_KEY) {
         return NextResponse.json({ ERROR: 'Bad Auth' }, { status: 401 });
      }
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

      // Get old value for logging
      const oldUser = await db.models.user.findOne(filter).select('-hash').lean() as UserIface;

      const res = await db.models.user.findOneAndUpdate(filter, body, {
         new: true,
         upsert: true,
         includeResultMetadata: true
      });
      const { hash, ...userWithoutHash } = res.value;
      res.value = userWithoutHash;

      // Log user update only for significant changes (not just config updates)
      const loggerEmail = body.email || 'system';
      const isConfigOnlyUpdate = Object.keys(body).length === 2 && body.email && body.config;

      if (oldUser && !isConfigOnlyUpdate) {
         // Only log updates for significant user property changes (name, role, db, etc.)
         await logUpdate(
            loggerEmail,
            'USER',
            { email: oldUser.email, name: oldUser.name, role: oldUser.role, db: oldUser.db },
            { email: res.value.email, name: res.value.name, role: res.value.role, db: res.value.db }
         );
      } else if (!oldUser) {
         // This was actually a creation via upsert
         await logCreate(
            loggerEmail,
            'USER',
            { email: res.value.email, name: res.value.name, role: res.value.role, db: res.value.db }
         );
      }
      // Skip logging for config-only updates to reduce log noise

      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}