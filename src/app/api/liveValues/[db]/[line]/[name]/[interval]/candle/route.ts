import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import indicatorSchema, { IndicatorIface } from '@/schemas/indicator'
import { NextResponse } from "next/server";
import _ from "lodash"
import { validateDatabaseName, invalidDatabaseResponse } from '@/lib/database-validation';

export async function GET(request: Request, { params }: { params: { db: string, line: string, name: string, interval: number } }) {
   try {
      // Validate that the database name is allowed
      if (!validateDatabaseName(params.db)) {
         return invalidDatabaseResponse();
      }

      let startTime = Math.floor(Date.now() - (params.interval * 60 * 60 * 1000));
      let numVelas = 30;
      let duradaVelas = ((params.interval * 60 * 60 * 1000) / numVelas);

      const filter = {
         "line": params.line, "name": params.name, "timestamp": { $gte: parseInt(startTime.toString()) }
      };

      const fields = [
         "-_id",
         "value",
         "timestamp"
      ];

      await dbConnect();
      const db = mongoose.connection.useDb(params.db, { useCache: false });
      if (!db.models.value) {
         db.model('value', indicatorSchema);
      }
      const values = await db.models.value.find(filter).select(fields).sort('timestamp').lean();
      const filteredValues: any[] = [];
      let arrayVelas: Array<Array<number>> = [];

      for (let i = 0; i < numVelas; i++) {
         const timestampVela = duradaVelas * (i + 1);
         let vela = {
            timestamp: startTime + timestampVela,
            open: 0,
            high: 0,
            low: 0,
            close: 0
         }
         values
            .filter((val) => (val.timestamp >= startTime + (duradaVelas * i)) && (val.timestamp <= startTime + timestampVela))
            .map((val, index) => {
               if (index == 0) {
                  vela.high = val.value
                  vela.low = val.value
                  if (arrayVelas.length >= 1) {
                     for (let i = 1; i <= arrayVelas.length; i++) {
                        if (arrayVelas[arrayVelas.length - i][4] != 0) {
                           vela.open = arrayVelas[arrayVelas.length - i][4];
                           vela.low = vela.open;
                           vela.high = vela.open;
                           break;
                        }
                     }
                     // vela.open = (arrayVelas[arrayVelas.length - 1][4] == 0) ?
                     //    arrayVelas[arrayVelas.length - 2][4] :
                     //    arrayVelas[arrayVelas.length - 1][4];

                  } else {
                     vela.open = val.value
                     vela.low = val.value
                     vela.high = val.value
                  }
               } else {
                  vela.high = (vela.high < val.value) ? val.value : vela.high;
                  vela.low = (vela.low < val.value) ? vela.low : val.value;
               }
               vela.close = val.value;
            })
         if (vela.open != 0 && vela.high != 0 && vela.low != 0 && vela.close != 0) {
            arrayVelas.push([vela.timestamp, vela.open, vela.high, vela.low, vela.close])
         }
      }
      // const liveValues = filteredValues.map((val) => ([val.timestamp, val.value]));
      return NextResponse.json(arrayVelas);
   } catch (err) {
      return NextResponse.json({ ERROR: (err as Error).message }, { status: 500 });
   }
}