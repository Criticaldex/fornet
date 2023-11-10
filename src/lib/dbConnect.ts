import mongoose from 'mongoose'

const MONGODB_URL = process.env.MONGO_HOST as string


if (!MONGODB_URL) {
   throw new Error(
      'Please define the MONGO_HOST environment variable inside .env.local'
   );
}

let cached = global.mongoose

if (!cached) {
   cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {

   let opts: any = {
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASS,
      // bufferCommands: false,
      // autoCreate: false,
   }

   if (cached.conn) {
      return cached.conn;
   } else {
      // Logic to check that the database is connected properly
      mongoose.connection.on('error', console.error.bind(console, 'CONNECTION ERROR:'));
      mongoose.connection.once('open', () => {
         console.log('<----------DATABASE CONNECTION OPEN ON:', MONGODB_URL, '---------->');
      });
      mongoose.connection.once('close', () => {
         console.log('<----------DATABASE CONNECTION CLOSED---------->');
      });
      // await mongoose.disconnect();
      cached.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
         return mongoose
      })
   }

   try {
      cached.conn = await cached.promise
   } catch (e) {
      cached.promise = null
      throw e
   }

   return cached.conn
}

export default dbConnect