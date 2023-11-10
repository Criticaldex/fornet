import mongoose from 'mongoose'

export interface ProfessionalIface {
   identificador: string,
   indicador: string,
   sector: string,
   any: string,
   centre?: string,
   invers: boolean,
   ordre: any,
   objectiu: any,
   dbName: string
}

const Schema = new mongoose.Schema({
   identificador: {
      type: String,
      required: [true, 'L\'identificador es obligatori!']
   },
   indicador: {
      type: String,
      required: [true, 'L\'indicador es obligatori!']
   },
   sector: {
      type: String,
      required: [true, 'El sector es obligatori!'],
   },
   any: {
      type: String,
      required: [true, 'L\'Any es obligatori!']
   },
   centre: {
      type: String,
      required: [true, 'El Centre es obligatori!']
   },
   invers: {
      type: Boolean,
   },
   ordre: {
      type: Number,
   },
   objectiu: {
      type: Number,
   },
});

export default Schema;