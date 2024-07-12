import mongoose from 'mongoose'

export interface ValueIface {
    name: string,
    line: string
}

const ValueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is mandatory!']
    },
    line: {
        type: String,
        required: [true, 'Line is mandatory!']
    }
});

export default ValueSchema;