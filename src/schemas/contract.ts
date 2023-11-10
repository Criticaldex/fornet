import mongoose from 'mongoose'

export interface ContractsIface {
   identificador: string,
   indicador: string,
   any: string,
   centre: string,
   invers: boolean,
   objectiu: string,
   dbName: string
}

const Schema = new mongoose.Schema({
   identificador: {
      type: String,
      required: [true, 'L\'identificador es obligatori!']
   },
   any: {
      type: String,
      required: [true, 'L\'Any es obligatori!']
   },
   centre: {
      type: String,
      required: [true, 'El Centre es obligatori!']
   },
   objectiu: {
      type: Number
   },
   invers: {
      type: Boolean
   }
});

export default Schema