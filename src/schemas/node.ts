import mongoose from 'mongoose'

export interface NodeIface {
   name: string,
   synced: boolean
}

const NodeSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Name is mandatory!']
   },
   synced: {
      type: Boolean,
      required: [true, 'Sync is mandatory!']
   }
});

export default NodeSchema;
