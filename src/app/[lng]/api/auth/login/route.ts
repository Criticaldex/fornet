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
               return NextResponse.json({ ERROR: "La llicencia ha caducat!" });
            }
         } else {
            return NextResponse.json({ ERROR: "Email o contrasenya incorrectes!" });
         }
      } catch (err) {
         return NextResponse.json({ ERROR: (err as Error).message });
      }
   } else {
      return NextResponse.json({ ERROR: 'Email i contrasenya obligatoris!' });
   }
}