import mongoose from 'mongoose'

export interface ValueIface {
   line: string,
   name?: string
}

const ValueSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [false, 'Name is mandatory!']
   },
   line: {
      type: String,
      required: [true, 'Line is mandatory!']
   }
});

export default ValueSchema;