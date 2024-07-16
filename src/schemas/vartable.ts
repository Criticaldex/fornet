import mongoose from 'mongoose'

export interface VartableIface {
   _id: any,
   line: string,
   name: string,
   plc_name: string,
   unit?: string
   address?: string
}

const VartableSchema = new mongoose.Schema({
   line: {
      type: String,
      required: [true, 'Line is mandatory!']
   },
   name: {
      type: String,
      required: [true, 'Name is mandatory!']
   },
   plc_name: {
      type: String,
      required: [true, 'Name is mandatory!']
   },
   unit: {
      type: String,
   },
   address: {
      type: String,
      required: [true, 'Line is mandatory!']
   }
});

export default VartableSchema;