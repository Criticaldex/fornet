import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import userSchema from '@/schemas/user'
import { compare } from 'bcryptjs';
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
   const body = await request.json()
   if (body.email && body.password) {
      await dbConnect();
      const db = mongoose.connection.useDb('Auth', { useCache: true });
      if (!db.models.user) {
         db.model('user', userSchema);
      }
      try {
         const user: any = await db.models.user.findOne({ "email": body.email }).select('-_id').lean();
         if (user && await compare(body.password, user.hash)) {
            const date = new Date();
            if (new Date(user.license.start) < date && new Date(user.license.end) > date) {
               const { hash, ...userWithoutHash } = user;
               return NextResponse.json(userWithoutHash);
            } else {
               return NextResponse.json({ ERROR: "Expired license, payment required!" }, { status: 403 });
            }
         } else {
            return NextResponse.json({ ERROR: "Incorrect Credentials!" }, { status: 401 });
         }
      } catch (err) {
         return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
      }
   } else {
      return NextResponse.json({ ERROR: 'Mail and Password required!' }, { status: 400 });
   }
}