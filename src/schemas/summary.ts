import mongoose from 'mongoose'

export interface SummaryIface {
   line: string,
   plc_name: string,
   name?: string,
   unit?: string,
   max?: number,
   min?: number,
   avg?: number,
   year?: number
   month?: number
   day?: number
   turn?: number
}

const SummarySchema = new mongoose.Schema({
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
      required: [true, 'Year is mandatory!']
   },
   month: {
      type: Number,
      required: [true, 'Month is mandatory!']
   },
   day: {
      type: Number,
      required: [true, 'Day is mandatory!']
   },
   turn: {
      type: Number,
      required: [true, 'Turn is mandatory!']
   },
});

export default SummarySchema;