import mongoose from 'mongoose'

export interface LogIface {
   user: string,
   resource: string,
   timestamp: number,
   newValue?: string
   oldValue?: string,
   message?: string,
}

const LogSchema = new mongoose.Schema({
   user: {
      type: String,
      required: [true, 'User is mandatory!'],
      index: true
   },
   resource: {
      type: String,
      required: [true, 'resource is mandatory!'],
      index: true
   },
   timestamp: {
      type: Number,
      required: [true, 'timestamp is mandatory!'],
      index: true
   },
   severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
      default: 'INFO',
      required: [true, 'severity is mandatory!'],
      index: true
   },
   newValue: {
      type: String,
   },
   oldValue: {
      type: String,
   },
   message: {
      type: String,
   }
});

LogSchema.index({ resource: 1, timestamp: 1, user: 1 });

export default LogSchema;