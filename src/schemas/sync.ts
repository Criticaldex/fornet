import mongoose from 'mongoose'

export interface SyncIface {
   synced: boolean
}

const SyncSchema = new mongoose.Schema({
   synced: {
      type: Boolean,
      required: [true, 'Sync is mandatory!']
   }
});

export default SyncSchema;