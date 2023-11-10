import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import indicatorSchema, { IndicatorIface } from '@/schemas/indicator'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
   try {
      const body = await request.json()
      const fields = (body.fields) ? body.fields.join(' ') : '';
      const dbName = body.db;
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.indicator) {
         db.model('indicator', indicatorSchema);
      }
      const indicator: any = await db.models.indicator.find(body.filter).select(fields).sort(body.sort).lean();
      return NextResponse.json(indicator);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}

export async function PATCH(request: Request) {
   try {
      const body: IndicatorIface = await request.json();
      if (!body.identificador || !body.any) {
         return NextResponse.json(`identificador i any obligatoris!`);
      }
      let filter = {};
      if (!body.centre) {
         filter = {
            any: body.any,
            identificador: body.identificador
         };
      } else {
         filter = {
            any: body.any,
            centre: body.centre,
            identificador: body.identificador
         };
      }

      const { dbName, ...bodyWithoutDB } = body
      await dbConnect();
      const db = mongoose.connection.useDb(dbName, { useCache: true });
      if (!db.models.indicator) {
         db.model('indicator', indicatorSchema);
      }
      const res = await db.models.indicator.updateMany(filter, bodyWithoutDB, {
         upsert: false,
      }).lean();

      return NextResponse.json(res);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message });
   }
}