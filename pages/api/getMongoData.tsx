import mongoose from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   if (req.method === 'POST') {
      if (req.body.model) {
         try {
            const { model, filter } = req.body;
            let { fields } = req.body;
            fields = (fields) ? fields.join(' ') : '';

            const db = await mongoose.createConnection(`${process.env.MONGO_HOST}/${process.env.MONGO_DB}`,
               {
                  authSource: process.env.MONGO_AUTH,
                  user: process.env.MONGO_USER,
                  pass: process.env.MONGO_PASS
               });
            const schema = mongoose.Schema;
            const data = await db.model(
               model,
               new schema()
            ).find(filter).select(fields).exec();
            res.status(200).json(data);
         } catch (err) {
            res.status(500).send({ ERROR: (err as Error).message });
         }
      } else {
         res.status(500).send({ ERROR: "Debes especificar el 'model' en el body de la peticion!" });
      }
   } else {
      res.status(500).send({ ERROR: 'Utiliza una peticion POST para consultar este endpoint!' });
   }
}