import mongoose from 'mongoose'

export interface ValueIface {
   line: string,
   plc_name: string,
   name?: string,
   unit?: string,
   value?: number | string,
   timestamp?: number
}

const ValueSchema = new mongoose.Schema({
   line: {
      type: String,
      required: [true, 'Line is mandatory!']
   },
   plc_name: {
      type: String,
      required: [true, 'Plc_name is mandatory!']
   },
   name: {
      type: String,
      required: [true, 'Name is mandatory!']
   },
   unit: {
      type: String,
   },
   value: {
      type: Number || String,
      required: [true, 'Value is mandatory!']
   },
   timestamp: {
      type: Number,
      required: [true, 'Timestamp is mandatory!']
   },
});

export default ValueSchema;