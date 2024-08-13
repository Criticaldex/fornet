import mongoose from 'mongoose'

export interface PlcIface {
   _id: any,
   line: string,
   name: string,
   ip: string
   type: string
}

const PlcSchema = new mongoose.Schema({
   line: {
      type: String,
      required: [true, 'Line is mandatory!']
   },
   name: {
      type: String,
      required: [true, 'Name is mandatory!']
   },
   ip: {
      type: String,
      required: [true, 'Ip is mandatory!']
   },
   type: {
      type: String,
      required: [true, 'Type is mandatory!']
   }
});

export default PlcSchema;