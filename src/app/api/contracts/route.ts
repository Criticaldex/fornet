import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import contractSchema, { ContractsIface } from '@/schemas/contract'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
   try {
      const body = await request.json()
      const fields = (body.fields) ? body.fields.join(' ') : '';
      const dbName = body.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.contract) {
         db.model('contract', contractSchema);
      }
      const contract: any = await db.models.contract.find(body.filter).select(fields).lean();
      return NextResponse.json(contract);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}

export async function PATCH(request: Request) {
   try {
      const body: ContractsIface = await request.json();
      if (!body.identificador || !body.any || !body.centre) {
         return NextResponse.json(`identificador, any i centre obligatoris!`);
      }
      const filter = {
         any: body.any,
         centre: body.centre,
         identificador: body.identificador
      }

      const { dbName, ...bodyWithoutDB } = body
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.contract) {
         db.model('contract', contractSchema);
      }
      const res = await db.models.contract.findOneAndUpdate(filter, bodyWithoutDB, {
         new: true,
         upsert: false,
         rawResult: true
      }).lean();
      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}