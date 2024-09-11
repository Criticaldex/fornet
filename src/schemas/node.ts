import mongoose from 'mongoose'

export interface NodeIface {
   name: string
}

const NodeSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Name is mandatory!']
   }
});

export default NodeSchema;
