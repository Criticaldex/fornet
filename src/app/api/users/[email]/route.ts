import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import userSchema, { UserIface } from '@/schemas/user'
import { NextResponse } from "next/server";
import { hash } from 'bcryptjs';

export async function GET(request: Request, { params }: { params: { email: string } }) {
   try {
      const dbName = 'Auth';
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.user) {
         db.model('user', userSchema);
      }
      const user = await db.models.user.findOne(params).select('-_id -hash').lean();

      return NextResponse.json(user);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}

export async function DELETE(request: Request, { params }: { params: { email: string } }) {
   try {
      // const body: UserIface = await request.json();
      if (!params.email) {
         return NextResponse.json(`Email Obligatori!`);
      }
      const dbName = 'Auth';
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.user) {
         db.model('user', userSchema);
      }
      const res = await db.models.user.findOneAndDelete(params);
      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}