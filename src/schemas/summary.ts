import mongoose from 'mongoose'

export interface SummaryIface {
   line: string,
   plc_name: string,
   name: string,
   unit?: string,
   max: number,
   min: number,
   avg: number,
   year: number
   month: number
   day: number
}

const SummarySchema = new mongoose.Schema({
   line: {
      type: String,
      required: [true, 'Line is mandatory!'],
      index: true
   },
   plc_name: {
      type: String,
      required: [true, 'Plc_name is mandatory!'],
      index: true
   },
   name: {
      type: String,
      required: [true, 'Name is mandatory!'],
      index: true
   },
   unit: {
      type: String,
   },
   max: {
      type: Number,
      required: [true, 'Max is mandatory!']
   },
   min: {
      type: Number,
      required: [true, 'Min is mandatory!']
   },
   avg: {
      type: Number,
      required: [true, 'Average is mandatory!']
   },
   year: {
      type: Number,
      required: [true, 'Year is mandatory!'],
      index: true
   },
   month: {
      type: Number,
      required: [true, 'Month is mandatory!'],
      index: true
   },
   day: {
      type: Number,
      required: [true, 'Day is mandatory!'],
      index: true
   }
});

SummarySchema.index({ line: 1, plc_name: 1, name: 1, year: 1, month: 1, day: 1 }, { unique: true });

export default SummarySchema;