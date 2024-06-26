import mongoose from 'mongoose'

export interface LabelIface {
    _id: string,
    name: string,
    unit: string,
    min: number,
    max: number,
    type: string,
    db: string
}

const LabelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is mandatory!']
    },
    unit: {
        type: String,
        required: [true, 'Unit is mandatory!']
    },
    min: {
        type: String,
    },
    max: {
        type: String,
    },
    type: {
        type: String,
        required: [true, 'Type is mandatory!']
    }
});

export default LabelSchema;