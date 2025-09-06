import mongoose, { Date } from 'mongoose'

export interface UserIface {
   name: string,
   lastname: string,
   email: string,
   password: string,
   alert: boolean,
   hash: string,
   license?: {
      start: string,
      end: string,
   },
   db: string,
   role: string,
   config: {
      live: any,
      summary: any
   }
}

const UserSchema = new mongoose.Schema({
   name: {
      type: String,
   },
   lastname: {
      type: String,
   },
   alert: {
      type: Boolean,
   },
   email: {
      type: String,
      required: [true, 'El correu es obligatori!'],
      unique: [true, 'Correu ja registrat!']
   },
   hash: {
      type: String,
      required: [true, 'La contrasenya es obligatoria!']
   },
   license: {
      start: {
         type: String,
      },
      end: {
         type: String,
      }
   },
   db: {
      type: String,
   },
   role: {
      type: String,
   },
   config: {
      type: Object,
   }
});

export default UserSchema;