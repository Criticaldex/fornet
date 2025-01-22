import mongoose from 'mongoose'

export interface SensorIface {
   _id?: any,
   line: string,
   name?: string,
   plc_name: string,
   unit?: string,
   address?: string,
   active?: boolean,
   node?: string
}

const SensorSchema = new mongoose.Schema({
   line: {
      type: String,
      required: [true, 'Line is mandatory!']
   },
   name: {
      type: String
   },
   plc_name: {
      type: String,
      required: [true, 'Line is mandatory!']
   },
   unit: {
      type: String
   },
   address: {
      type: String
   },
   active: {
      type: Boolean
   },
   node: {
      type: String
   }
});

export default SensorSchema;
