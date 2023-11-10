import mongoose, { Date } from 'mongoose'

export interface UserIface {
   name: string,
   lastname: string,
   email: string,
   password: string,
   hash: string,
   license: {
      start: string,
      end: string,
   },
   db: string,
   role: string,
}

const UserSchema = new mongoose.Schema({
   name: {
      type: String,
   },
   lastname: {
      type: String,
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
   }
});

export default UserSchema;