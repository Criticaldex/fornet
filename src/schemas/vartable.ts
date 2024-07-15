import mongoose from 'mongoose'

export interface VartableIface {
   name: string,
   plc_name: string,
   line: string,
   unit: string
   address: string
}

const VartableSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Name is mandatory!']
   },
   plc_name: {
      type: String,
      required: [true, 'Name is mandatory!']
   },
   line: {
      type: String,
      required: [true, 'Line is mandatory!']
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